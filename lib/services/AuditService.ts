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
   * Log an audit action
   */
  async logAction(data: Omit<AuditLog, 'id' | 'createdAt'>): Promise<void> {
    try {
      const auditData = {
        ...data,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, this.collectionName), auditData);
    } catch (error) {
      console.error('Error logging audit action:', error);
      // Don't throw - audit logging should not break main functionality
    }
  }

  /**
   * Get recent activity for dashboard
   */
  async getRecentActivity(limitCount: number = 10): Promise<AuditLog[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          timestamp: data.timestamp || (data.createdAt ? data.createdAt.toMillis?.() || data.createdAt.getTime?.() || Date.now() : Date.now()),
          userId: data.userId,
          userEmail: data.userEmail,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          details: data.details,
        } as AuditLog;
      });
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  /**
   * Get audit logs with filtering and pagination
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
      
      let logs: AuditLog[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          timestamp: data.timestamp || (data.createdAt ? data.createdAt.toMillis?.() || data.createdAt.getTime?.() || Date.now() : Date.now()),
          userId: data.userId,
          userEmail: data.userEmail,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          details: data.details,
        } as AuditLog;
      });
      
      // Apply search filter in memory if needed
      if (search) {
        const searchLower = search.toLowerCase();
        logs = logs.filter(log =>
          (typeof log.details?.title === 'string' && log.details.title.toLowerCase().includes(searchLower)) ||
          (typeof log.userEmail === 'string' && log.userEmail.toLowerCase().includes(searchLower)) ||
          (typeof log.entityId === 'string' && log.entityId.toLowerCase().includes(searchLower)) ||
          (typeof log.action === 'string' && log.action.toLowerCase().includes(searchLower)) ||
          (typeof log.entity === 'string' && log.entity.toLowerCase().includes(searchLower))
        );
      }
      
      return {
        logs,
        total: logs.length, // Note: This is approximate due to Firestore limitations
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
   * Get audit logs by user
   */
  async getAuditLogsByUser(userId: string): Promise<AuditLog[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          timestamp: data.timestamp || (data.createdAt ? data.createdAt.toMillis?.() || data.createdAt.getTime?.() || Date.now() : Date.now()),
          userId: data.userId,
          userEmail: data.userEmail,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          details: data.details,
        } as AuditLog;
      });
    } catch (error) {
      console.error('Error fetching user audit logs:', error);
      return [];
    }
  }

  /**
   * Get audit logs by entity
   */
  async getAuditLogsByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('entityType', '==', entityType),
        where('entityId', '==', entityId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          timestamp: data.timestamp || (data.createdAt ? data.createdAt.toMillis?.() || data.createdAt.getTime?.() || Date.now() : Date.now()),
          userId: data.userId,
          userEmail: data.userEmail,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          details: data.details,
        } as AuditLog;
      });
    } catch (error) {
      console.error('Error fetching entity audit logs:', error);
      return [];
    }
  }
} 