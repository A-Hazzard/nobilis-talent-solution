import { NextRequest } from 'next/server';
import { AuditService } from '@/lib/services/AuditService';

/**
 * Extract client IP address from request headers
 */
export function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP address
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  const xClientIP = request.headers.get('x-client-ip');
  const xForwardedFor = request.headers.get('x-forwarded-for');
  
  // Try to get the first IP from x-forwarded-for (in case of multiple proxies)
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0];
  }
  
  // Try other headers
  if (realIP) return realIP;
  if (cfConnectingIP) return cfConnectingIP;
  if (xClientIP) return xClientIP;
  if (xForwardedFor) return xForwardedFor;
  
  // Fallback - NextRequest doesn't have direct IP access
  return 'unknown';
}

/**
 * Extract user agent from request headers
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Get request metadata for audit logging
 */
export function getRequestMetadata(request: NextRequest) {
  return {
    ipAddress: getClientIP(request),
    userAgent: getUserAgent(request),
    method: request.method,
    url: request.url,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Enhanced audit logger for server-side operations
 */
export class ServerAuditLogger {
  private static instance: ServerAuditLogger;
  private auditService: AuditService;

  private constructor() {
    this.auditService = AuditService.getInstance();
  }

  static getInstance(): ServerAuditLogger {
    if (!ServerAuditLogger.instance) {
      ServerAuditLogger.instance = new ServerAuditLogger();
    }
    return ServerAuditLogger.instance;
  }

  /**
   * Log an audit action with enhanced details and server-side metadata
   */
  async logAction(
    request: NextRequest,
    user: { id: string; email: string },
    data: {
      action: 'create' | 'update' | 'delete' | 'login';
      entity: 'lead' | 'resource' | 'testimonial' | 'auth' | 'blog' | 'calendar' | 'contact';
      entityId?: string;
      details?: Record<string, any>;
      beforeData?: Record<string, any>;
      afterData?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      const requestMetadata = getRequestMetadata(request);
      
      // Create enhanced details with before/after comparison
      const enhancedDetails = {
        ...data.details,
        ...requestMetadata,
        beforeData: data.beforeData,
        afterData: data.afterData,
        changes: this.generateChangesSummary(data.beforeData, data.afterData),
      };

      // Generate descriptive title
      const title = this.generateAuditTitle(data.action, data.entity, data.beforeData, data.afterData, data.details);

      await this.auditService.logAction({
        userId: user.id,
        userEmail: user.email,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        timestamp: Date.now(),
        details: {
          ...enhancedDetails,
          title,
        },
      });
    } catch (error) {
      console.error('Error logging server audit action:', error);
      // Don't throw - audit logging should not break main functionality
    }
  }

  /**
   * Generate a descriptive audit title based on the action and data changes
   */
  private generateAuditTitle(
    action: string,
    entity: string,
    beforeData?: Record<string, any>,
    afterData?: Record<string, any>,
    details?: Record<string, any>
  ): string {
    const entityName = this.getEntityDisplayName(entity);
    
    switch (action) {
      case 'create':
        return `Created ${entityName}${details?.name || details?.title ? `: ${details.name || details.title}` : ''}`;
      
      case 'delete':
        return `Deleted ${entityName}${beforeData?.name || beforeData?.title ? `: ${beforeData.name || beforeData.title}` : ''}`;
      
      case 'update':
        if (beforeData && afterData) {
          const changes = this.getSignificantChanges(beforeData, afterData);
          if (changes.length > 0) {
            return `Updated ${entityName} - ${changes.join(', ')}`;
          }
        }
        return `Updated ${entityName}`;
      
      case 'login':
        return `Admin login`;
      
      default:
        return `${action} ${entityName}`;
    }
  }

  /**
   * Get display name for entity type
   */
  private getEntityDisplayName(entity: string): string {
    const entityMap: Record<string, string> = {
      'resource': 'invoice/payment',
      'lead': 'lead',
      'testimonial': 'testimonial',
      'blog': 'blog post',
      'calendar': 'calendar event',
      'auth': 'authentication',
    };
    
    return entityMap[entity] || entity;
  }

  /**
   * Generate a summary of changes between before and after data
   */
  private generateChangesSummary(beforeData?: Record<string, any>, afterData?: Record<string, any>): Record<string, any> {
    if (!beforeData || !afterData) return {};

    const changes: Record<string, any> = {};
    
    // Compare all fields
    const allKeys = new Set([...Object.keys(beforeData), ...Object.keys(afterData)]);
    
    for (const key of allKeys) {
      const before = beforeData[key];
      const after = afterData[key];
      
      if (before !== after) {
        changes[key] = {
          before: before,
          after: after,
        };
      }
    }
    
    return changes;
  }

  /**
   * Get significant changes for title generation
   */
  private getSignificantChanges(beforeData: Record<string, any>, afterData: Record<string, any>): string[] {
    const changes: string[] = [];
    const significantFields = ['status', 'name', 'title', 'email', 'amount', 'total'];
    
    for (const field of significantFields) {
      if (beforeData[field] !== afterData[field] && afterData[field] !== undefined) {
        const displayField = field === 'status' ? 'status' : field;
        changes.push(`${displayField}: ${beforeData[field]} → ${afterData[field]}`);
      }
    }
    
    return changes;
  }

  /**
   * Log payment/invoice status update with specific details
   */
  async logPaymentStatusUpdate(
    request: NextRequest,
    user: { id: string; email: string },
    paymentData: {
      id: string;
      type: 'invoice' | 'pending-payment';
      clientName: string;
      clientEmail: string;
      previousStatus: string;
      newStatus: string;
      amount: number;
    }
  ): Promise<void> {
    await this.logAction(request, user, {
      action: 'update',
      entity: 'resource',
      entityId: paymentData.id,
      beforeData: { status: paymentData.previousStatus },
      afterData: { status: paymentData.newStatus },
      details: {
        paymentType: paymentData.type,
        clientName: paymentData.clientName,
        clientEmail: paymentData.clientEmail,
        amount: paymentData.amount,
      },
    });
  }

  /**
   * Log invoice deletion with specific details
   */
  async logInvoiceDeletion(
    request: NextRequest,
    user: { id: string; email: string },
    invoiceData: {
      id: string;
      invoiceNumber: string;
      clientName: string;
      clientEmail: string;
      total: number;
      status: string;
    }
  ): Promise<void> {
    await this.logAction(request, user, {
      action: 'delete',
      entity: 'resource',
      entityId: invoiceData.id,
      beforeData: {
        invoiceNumber: invoiceData.invoiceNumber,
        clientName: invoiceData.clientName,
        clientEmail: invoiceData.clientEmail,
        total: invoiceData.total,
        status: invoiceData.status,
      },
      details: {
        paymentType: 'invoice',
        invoiceNumber: invoiceData.invoiceNumber,
        clientName: invoiceData.clientName,
        clientEmail: invoiceData.clientEmail,
        total: invoiceData.total,
        status: invoiceData.status,
      },
    });
  }
}

/**
 * Backward compatibility function for existing services
 * @deprecated Use ServerAuditLogger.getInstance().logAction() instead
 */
export async function logAdminAction(data: {
  action: 'create' | 'update' | 'delete' | 'login';
  entity: 'lead' | 'resource' | 'testimonial' | 'auth' | 'blog' | 'calendar' | 'contact';
  entityId?: string;
  details?: Record<string, any>;
  userId?: string;
  userEmail?: string;
}): Promise<void> {
  try {
    const auditService = AuditService.getInstance();
    await auditService.logAction({
      userId: data.userId || 'unknown',
      userEmail: data.userEmail || 'unknown',
      action: data.action,
      entity: data.entity as 'lead' | 'resource' | 'testimonial' | 'auth' | 'blog' | 'calendar',
      entityId: data.entityId,
      timestamp: Date.now(),
      details: {
        ...data.details,
        ipAddress: 'client-side', // Legacy - not ideal but maintains compatibility
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in logAdminAction:', error);
    // Don't throw - audit logging should not break main functionality
  }
} 