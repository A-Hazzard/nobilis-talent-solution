import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { AuditLog } from '@/shared/types/audit';
import type { PaginationParams, FilterParams } from '@/shared/types/common';

export class AuditService {
  private static instance: AuditService;
  private readonly collectionName = 'audit-logs';

  private constructor() {}

  static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  /**
   * Safely convert Firestore timestamp to Date
   */
  private convertFirestoreTimestamp(timestamp: any): Date {
    if (!timestamp) {
      return new Date();
    }

    // If it's already a Date object
    if (timestamp instanceof Date) {
      return timestamp;
    }

    // If it's a Firestore Timestamp object
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }

    // If it's a Firestore timestamp with seconds/nanoseconds
    if (timestamp && typeof timestamp.seconds === 'number') {
      return new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
    }

    // If it's a number (Unix timestamp)
    if (typeof timestamp === 'number') {
      return new Date(timestamp);
    }

    // If it's a string, try to parse it
    if (typeof timestamp === 'string') {
      const parsed = new Date(timestamp);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    // Fallback to current time
    return new Date();
  }

  /**
   * Safely parse JSON data
   */
  private safeJsonParse(data: any): any {
    if (!data) {
      return null;
    }

    // If it's already an object, return it
    if (typeof data === 'object' && data !== null) {
      return data;
    }

    // If it's a string, try to parse it
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.warn('Failed to parse JSON string:', data, error);
        return { message: data };
      }
    }

    return data;
  }

  /**
   * Validate and sanitize audit log data
   */
  private validateAuditData(data: any): Partial<AuditLog> {
    const validated: Partial<AuditLog> = {};

    try {
      // Validate timestamp
      validated.timestamp = this.convertFirestoreTimestamp(data.timestamp || data.createdAt).getTime();

      // Validate userId
      if (data.userId && typeof data.userId === 'string') {
        validated.userId = data.userId;
      }

      // Validate userEmail
      if (data.userEmail && typeof data.userEmail === 'string') {
        validated.userEmail = data.userEmail;
      }

      // Validate action
      const validActions = ['login', 'create', 'update', 'delete'] as const;
      if (data.action && validActions.includes(data.action)) {
        validated.action = data.action;
      }

      // Validate entity
      const validEntities = ['lead', 'resource', 'testimonial', 'blog', 'calendar', 'auth'] as const;
      if (data.entity && validEntities.includes(data.entity)) {
        validated.entity = data.entity;
      }

      // Validate entityId
      if (data.entityId && typeof data.entityId === 'string') {
        validated.entityId = data.entityId;
      }

      // Validate and parse details
      if (data.details) {
        validated.details = this.safeJsonParse(data.details);
      }

      return validated;
    } catch (error) {
      console.error('Error validating audit data:', error, data);
      return { timestamp: Date.now() };
    }
  }

  /**
   * Log an audit action with retry mechanism
   */
  async logAction(data: Omit<AuditLog, 'id' | 'createdAt'>, retryCount = 0): Promise<void> {
    const maxRetries = 3;
    
    try {
      const auditData = {
        ...data,
        createdAt: serverTimestamp(),
        timestamp: data.timestamp || Date.now(),
        // Ensure details is properly serialized
        details: typeof data.details === 'string' ? data.details : JSON.stringify(data.details || {}),
      };

      await addDoc(collection(db, this.collectionName), auditData);
    } catch (error) {
      console.error(`Error logging audit action (attempt ${retryCount + 1}):`, error);
      
      // Retry mechanism for failed audit entries
      if (retryCount < maxRetries) {
        console.log(`Retrying audit log entry (${retryCount + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return this.logAction(data, retryCount + 1);
      }
      
      // Don't throw - audit logging should not break main functionality
      console.error('Max retries reached for audit logging, skipping...');
    }
  }

  /**
   * Get recent activity for dashboard with improved error handling
   */
  async getRecentActivity(limitCount: number = 10): Promise<AuditLog[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      
      const logs: AuditLog[] = [];
      
      for (const doc of snapshot.docs) {
        try {
          const data = doc.data();
          const validatedData = this.validateAuditData(data);
          
          // Ensure required fields are present
          if (validatedData.userId && validatedData.action && validatedData.entity) {
            logs.push({
              id: doc.id,
              ...validatedData,
            } as AuditLog);
          } else {
            console.warn('Invalid audit log data - missing required fields:', { 
              docId: doc.id, 
              userId: validatedData.userId,
              action: validatedData.action,
              entity: validatedData.entity 
            });
          }
        } catch (error) {
          console.error('Error processing audit log:', { docId: doc.id, error });
          // Continue processing other logs
        }
      }
      
      return logs;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  /**
   * Get audit logs with filtering and pagination with improved error handling
   */
  async getAuditLogs(options: Partial<PaginationParams & FilterParams> = {}): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
    error?: string;
  }> {
    try {
      const { page = 1, limit: pageLimit = 10, search, entityType, action, userId } = options;
      
      const constraints: QueryConstraint[] = [];
      
      // Apply filters
      if (entityType && entityType !== 'all') {
        constraints.push(where('entity', '==', entityType));
      }
      
      if (action && action !== 'all') {
        constraints.push(where('action', '==', action));
      }
      
      if (userId) {
        constraints.push(where('userId', '==', userId));
      }
      
      // Always order by creation date
      constraints.push(orderBy('createdAt', 'desc'));
      
      // Apply pagination
      constraints.push(limit(pageLimit));
      
      const q = query(collection(db, this.collectionName), ...constraints);
      const snapshot = await getDocs(q);
      
      let logs: AuditLog[] = [];
      
      for (const doc of snapshot.docs) {
        try {
          const data = doc.data();
          const validatedData = this.validateAuditData(data);
          
          // Ensure required fields are present
          if (validatedData.userId && validatedData.action && validatedData.entity) {
            logs.push({
              id: doc.id,
              ...validatedData,
            } as AuditLog);
          } else {
            console.warn('Invalid audit log data - missing required fields:', { 
              docId: doc.id, 
              userId: validatedData.userId,
              action: validatedData.action,
              entity: validatedData.entity 
            });
          }
        } catch (error) {
          console.error('Error processing audit log:', { docId: doc.id, error });
          // Continue processing other logs
        }
      }
      
      // Apply search filter in memory if needed
      if (search) {
        const searchLower = search.toLowerCase();
        logs = logs.filter(log => {
          // Handle details field properly - it can be a string or an object
          const detailsTitle = typeof log.details === 'string' 
            ? log.details 
            : log.details?.title || '';
          
          return (
            (typeof detailsTitle === 'string' && detailsTitle.toLowerCase().includes(searchLower)) ||
            (typeof log.userEmail === 'string' && log.userEmail.toLowerCase().includes(searchLower)) ||
            (typeof log.entityId === 'string' && log.entityId.toLowerCase().includes(searchLower)) ||
            (typeof log.action === 'string' && log.action.toLowerCase().includes(searchLower)) ||
            (typeof log.entity === 'string' && log.entity.toLowerCase().includes(searchLower))
          );
        });
      }
      
      return {
        logs: logs || [],
        total: logs.length,
        page,
        limit: pageLimit,
      };
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return {
        logs: [],
        total: 0,
        page: 1,
        limit: 10,
        error: 'Failed to fetch audit logs',
      };
    }
  }

  /**
   * Get audit logs by user with improved error handling
   */
  async getAuditLogsByUser(userId: string): Promise<AuditLog[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const logs: AuditLog[] = [];
      
      for (const doc of snapshot.docs) {
        try {
          const data = doc.data();
          const validatedData = this.validateAuditData(data);
          
          // Ensure required fields are present
          if (validatedData.userId && validatedData.action && validatedData.entity) {
            logs.push({
              id: doc.id,
              ...validatedData,
            } as AuditLog);
          } else {
            console.warn('Invalid audit log data - missing required fields:', { 
              docId: doc.id, 
              userId: validatedData.userId,
              action: validatedData.action,
              entity: validatedData.entity 
            });
          }
        } catch (error) {
          console.error('Error processing audit log:', { docId: doc.id, error });
          // Continue processing other logs
        }
      }
      
      return logs;
    } catch (error) {
      console.error('Error fetching user audit logs:', error);
      return [];
    }
  }

  /**
   * Get audit logs by entity with improved error handling
   */
  async getAuditLogsByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('entity', '==', entityType),
        where('entityId', '==', entityId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const logs: AuditLog[] = [];
      
      for (const doc of snapshot.docs) {
        try {
          const data = doc.data();
          const validatedData = this.validateAuditData(data);
          
          // Ensure required fields are present
          if (validatedData.userId && validatedData.action && validatedData.entity) {
            logs.push({
              id: doc.id,
              ...validatedData,
            } as AuditLog);
          } else {
            console.warn('Invalid audit log data - missing required fields:', { 
              docId: doc.id, 
              userId: validatedData.userId,
              action: validatedData.action,
              entity: validatedData.entity 
            });
          }
        } catch (error) {
          console.error('Error processing audit log:', { docId: doc.id, error });
          // Continue processing other logs
        }
      }
      
      return logs;
    } catch (error) {
      console.error('Error fetching entity audit logs:', error);
      return [];
    }
  }

  /**
   * Clean up old audit logs (utility function)
   */
  async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const q = query(
        collection(db, this.collectionName),
        where('createdAt', '<', cutoffDate)
      );
      
      const snapshot = await getDocs(q);
      let deletedCount = 0;
      
      // Note: In a real implementation, you'd use a batch delete
      // For now, we'll just return the count of logs that should be deleted
      deletedCount = snapshot.docs.length;
      
      console.log(`Found ${deletedCount} audit logs older than ${daysToKeep} days`);
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old audit logs:', error);
      return 0;
    }
  }
} 