import { useUserStore } from '@/lib/stores/userStore';
import { AuditService } from '@/lib/services/AuditService';
import type { AuditLog } from '@/shared/types/audit';
import { 
  User, 
  FileText, 
  MessageSquare, 
  Calendar, 
  FileImage, 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  LogIn,
  Activity
} from 'lucide-react';
import * as XLSX from 'xlsx';

/**
 * Get current user from the user store
 * This can be called from any service to get the current authenticated user
 */
export const getCurrentUser = (): { id: string; email: string; role: 'admin' | 'user' } | null => {
  const user = useUserStore.getState().user;
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
};

/**
 * Format time ago for display
 */
export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

/**
 * Format date for Excel export
 */
export const formatDateForExcel = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Export audit logs to Excel
 */
export const exportAuditLogsToExcel = async (logs: AuditLog[], filters?: {
  searchTerm?: string;
  entityTypeFilter?: string;
  actionFilter?: string;
}): Promise<void> => {
  try {
    // Prepare data for Excel
    const excelData = logs.map(log => ({
      'Timestamp': formatDateForExcel(log.timestamp),
      'Action': log.action.toUpperCase(),
      'Entity Type': log.entity.toUpperCase(),
      'Entity ID': log.entityId || '',
      'Entity Title': log.details?.title || '',
      'User Email': log.userEmail || '',
      'User ID': log.userId,
      'Details': typeof log.details === 'string' ? log.details : JSON.stringify(log.details || {}),
      'IP Address': log.details?.ipAddress || '',
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Timestamp
      { wch: 12 }, // Action
      { wch: 15 }, // Entity Type
      { wch: 15 }, // Entity ID
      { wch: 30 }, // Entity Title
      { wch: 25 }, // User Email
      { wch: 25 }, // User ID
      { wch: 40 }, // Details
      { wch: 15 }, // IP Address
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Logs');

    // Generate filename with filters
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    
    let filename = `audit-logs-${dateStr}-${timeStr}`;
    if (filters?.searchTerm) {
      filename += `-search-${filters.searchTerm}`;
    }
    if (filters?.entityTypeFilter && filters.entityTypeFilter !== 'all') {
      filename += `-entity-${filters.entityTypeFilter}`;
    }
    if (filters?.actionFilter && filters.actionFilter !== 'all') {
      filename += `-action-${filters.actionFilter}`;
    }
    filename += '.xlsx';

    // Download the file
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Error exporting audit logs to Excel:', error);
    throw new Error('Failed to export audit logs');
  }
};

/**
 * Get icon for entity type with color symbolism
 */
export const getEntityIcon = (entityType: string) => {
  const iconMap = {
    lead: { icon: User, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    resource: { icon: FileText, color: 'text-green-600', bgColor: 'bg-green-100' },
    testimonial: { icon: MessageSquare, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    calendar: { icon: Calendar, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    blog: { icon: FileImage, color: 'text-pink-600', bgColor: 'bg-pink-100' },
    auth: { icon: Shield, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  };

  const config = iconMap[entityType as keyof typeof iconMap] || { 
    icon: Activity, 
    color: 'text-gray-600', 
    bgColor: 'bg-gray-100' 
  };

  return {
    Icon: config.icon,
    color: config.color,
    bgColor: config.bgColor,
  };
};

/**
 * Get icon for action type with color symbolism
 */
export const getActionIcon = (action: string) => {
  const iconMap = {
    create: { icon: Plus, color: 'text-green-600', bgColor: 'bg-green-100' },
    update: { icon: Edit, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    delete: { icon: Trash2, color: 'text-red-600', bgColor: 'bg-red-100' },
    login: { icon: LogIn, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  };

  const config = iconMap[action as keyof typeof iconMap] || { 
    icon: Activity, 
    color: 'text-gray-600', 
    bgColor: 'bg-gray-100' 
  };

  return {
    Icon: config.icon,
    color: config.color,
    bgColor: config.bgColor,
  };
};

/**
 * Get color scheme for action badges
 */
export const getActionBadgeColors = (action: string) => {
  const colorMap = {
    create: 'bg-green-100 text-green-800 border-green-200',
    update: 'bg-blue-100 text-blue-800 border-blue-200',
    delete: 'bg-red-100 text-red-800 border-red-200',
    login: 'bg-purple-100 text-purple-800 border-purple-200',
  };
  
  return colorMap[action as keyof typeof colorMap] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Get color scheme for entity type badges
 */
export const getEntityTypeBadgeColors = (entityType: string) => {
  const colorMap = {
    lead: 'bg-blue-100 text-blue-800 border-blue-200',
    resource: 'bg-green-100 text-green-800 border-green-200',
    testimonial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    calendar: 'bg-purple-100 text-purple-800 border-purple-200',
    blog: 'bg-pink-100 text-pink-800 border-pink-200',
    auth: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  
  return colorMap[entityType as keyof typeof colorMap] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Get activity description for dashboard display
 */
export const getActivityDescription = (log: AuditLog): string => {
  const actionMap = {
    create: 'Created',
    update: 'Updated',
    delete: 'Deleted',
    login: 'Logged in',
  };

  const entityMap = {
    lead: 'lead',
    resource: 'resource',
    testimonial: 'testimonial',
    blog: 'blog post',
    calendar: 'calendar event',
    auth: 'authentication',
  };

  const action = actionMap[log.action] || log.action;
  const entity = entityMap[log.entity] || log.entity;
  
  return `${action} ${entity}`;
};

/**
 * Log an audit action with current user context
 */
export const logAuditAction = async (data: Omit<AuditLog, 'id' | 'createdAt' | 'userId' | 'userEmail'>): Promise<void> => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.warn('No current user found for audit logging');
    return;
  }
  
  const auditService = AuditService.getInstance();
  await auditService.logAction({
    ...data,
    userId: currentUser.id,
    userEmail: currentUser.email,
  });
};

/**
 * Log admin login action
 */
export const logAdminLogin = async (ipAddress?: string, userAgent?: string): Promise<void> => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return;
  }
  
  const auditService = AuditService.getInstance();
  await auditService.logAction({
    userId: currentUser.id,
    userEmail: currentUser.email,
    action: 'login',
    entity: 'auth',
    details: { ipAddress, userAgent },
    timestamp: Date.now(),
  });
}; 