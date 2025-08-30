import { AuditService } from '@/lib/services/AuditService';
import type { AuditLog } from '@/shared/types/audit';
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  serverTimestamp: jest.fn(),
}));

jest.mock('@/lib/firebase/config', () => ({
  db: {},
}));

const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockWhere = where as jest.MockedFunction<typeof where>;
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
const mockLimit = limit as jest.MockedFunction<typeof limit>;
const mockServerTimestamp = serverTimestamp as jest.MockedFunction<typeof serverTimestamp>;

describe('AuditService', () => {
  let auditService: AuditService;

  beforeEach(() => {
    jest.clearAllMocks();
    auditService = AuditService.getInstance();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = AuditService.getInstance();
      const instance2 = AuditService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('logAction', () => {
    const mockAuditData = {
      action: 'USER_LOGIN',
      userId: 'user-123',
      userEmail: 'test@example.com',
      entity: 'user',
      entityId: 'user-123',
      details: { ip: '192.168.1.1' },
      category: 'auth' as const,
    };

    it('should log action successfully', async () => {
      mockCollection.mockReturnValue('audit-logs' as any);
      mockServerTimestamp.mockReturnValue(new Date());
      mockAddDoc.mockResolvedValue({ id: 'new-log-id' } as any);

      await auditService.logAction(mockAuditData);

      expect(mockAddDoc).toHaveBeenCalledWith(
        'audit-logs',
        expect.objectContaining({
          action: 'USER_LOGIN',
          userId: 'user-123',
          userEmail: 'test@example.com',
          entity: 'user',
          entityId: 'user-123',
          details: '{"ip":"192.168.1.1"}', // Details are stringified
          category: 'auth',
          createdAt: expect.any(Date),
          timestamp: expect.any(Number),
        })
      );
    });

    it('should handle logging errors gracefully', async () => {
      mockCollection.mockReturnValue('audit-logs' as any);
      mockServerTimestamp.mockReturnValue(new Date());
      mockAddDoc.mockRejectedValue(new Error('Firebase error'));

      // Should not throw an error, but may take time due to retries
      await expect(auditService.logAction(mockAuditData)).resolves.not.toThrow();
    }, 10000); // Increase timeout to 10 seconds
  });

  describe('getRecentActivity', () => {
    it('should handle fetch errors gracefully', async () => {
      mockCollection.mockReturnValue('audit-logs' as any);
      mockQuery.mockReturnValue('query' as any);
      mockOrderBy.mockReturnValue('orderBy' as any);
      mockLimit.mockReturnValue('limit' as any);
      mockGetDocs.mockRejectedValue(new Error('Firebase error'));

      const result = await auditService.getRecentActivity();

      expect(result).toEqual([]);
    });
  });

  describe('getAuditLogs', () => {
    it('should handle fetch errors', async () => {
      mockCollection.mockReturnValue('audit-logs' as any);
      mockQuery.mockReturnValue('query' as any);
      mockOrderBy.mockReturnValue('orderBy' as any);
      mockLimit.mockReturnValue('limit' as any);
      mockGetDocs.mockRejectedValue(new Error('Firebase error'));

      const result = await auditService.getAuditLogs();

      expect(result.error).toBe('Failed to fetch audit logs');
      expect(result.logs).toEqual([]);
    });
  });
});