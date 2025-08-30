import { logAdminAction } from '@/lib/helpers/auditLogger';
import { collection, addDoc } from 'firebase/firestore';
import type { AuditLog } from '@/shared/types/audit';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
}));

jest.mock('@/lib/firebase/config', () => ({
  db: {},
}));

const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;

describe('auditLogger', () => {
  const mockLogData: Omit<AuditLog, 'id'> = {
    action: 'USER_CREATED',
    userId: 'admin-123',
    userEmail: 'admin@example.com',
    details: { newUserId: 'user-456', userEmail: 'newuser@example.com' },
    timestamp: new Date('2024-01-15T10:30:00Z'),
    category: 'user',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to avoid noise in test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('logAdminAction', () => {

    it('should log admin action successfully', async () => {
      mockCollection.mockReturnValue('adminLogs' as any);
      mockAddDoc.mockResolvedValue({ id: 'new-log-id' } as any);

      await logAdminAction(mockLogData);

      expect(mockCollection).toHaveBeenCalledWith({}, 'adminLogs');
      expect(mockAddDoc).toHaveBeenCalledWith('adminLogs', {
        action: 'USER_CREATED',
        userId: 'admin-123',
        userEmail: 'admin@example.com',
        details: { newUserId: 'user-456', userEmail: 'newuser@example.com' },
        timestamp: mockLogData.timestamp,
        category: 'user',
      });
    });

    it('should add timestamp if not provided', async () => {
      const logDataWithoutTimestamp = { ...mockLogData };
      delete (logDataWithoutTimestamp as any).timestamp;

      mockCollection.mockReturnValue('adminLogs' as any);
      mockAddDoc.mockResolvedValue({ id: 'new-log-id' } as any);

      // Mock Date.now() to return a consistent value
      const mockTimestamp = 1705305600000; // Jan 15, 2024
      jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

      await logAdminAction(logDataWithoutTimestamp);

      expect(mockAddDoc).toHaveBeenCalledWith('adminLogs', {
        ...logDataWithoutTimestamp,
        timestamp: mockTimestamp,
      });

      Date.now = jest.fn().mockRestore();
    });

    it('should handle Firebase errors gracefully', async () => {
      mockCollection.mockReturnValue('adminLogs' as any);
      mockAddDoc.mockRejectedValue(new Error('Firebase connection failed'));

      // Should not throw an error
      await expect(logAdminAction(mockLogData)).resolves.not.toThrow();

      expect(console.error).toHaveBeenCalledWith(
        'Failed to log admin action:',
        expect.any(Error)
      );
    });

    it('should handle different log data structures', async () => {
      const minimalLogData: Omit<AuditLog, 'id'> = {
        action: 'ADMIN_LOGIN',
        userId: 'admin-123',
        userEmail: 'admin@example.com',
        details: {},
        timestamp: new Date(),
        category: 'auth',
      };

      mockCollection.mockReturnValue('adminLogs' as any);
      mockAddDoc.mockResolvedValue({ id: 'new-log-id' } as any);

      await logAdminAction(minimalLogData);

      expect(mockAddDoc).toHaveBeenCalledWith('adminLogs', minimalLogData);
    });

    it('should handle null or undefined details', async () => {
      const logDataWithNullDetails = {
        ...mockLogData,
        details: null,
      };

      mockCollection.mockReturnValue('adminLogs' as any);
      mockAddDoc.mockResolvedValue({ id: 'new-log-id' } as any);

      await logAdminAction(logDataWithNullDetails as any);

      expect(mockAddDoc).toHaveBeenCalledWith('adminLogs', {
        ...mockLogData,
        details: null,
      });
    });

    it('should preserve existing timestamp when provided', async () => {
      const specificTimestamp = new Date('2024-02-20T15:45:00Z');
      const logDataWithSpecificTime = {
        ...mockLogData,
        timestamp: specificTimestamp,
      };

      mockCollection.mockReturnValue('adminLogs' as any);
      mockAddDoc.mockResolvedValue({ id: 'new-log-id' } as any);

      await logAdminAction(logDataWithSpecificTime);

      expect(mockAddDoc).toHaveBeenCalledWith('adminLogs', {
        ...mockLogData,
        timestamp: specificTimestamp,
      });
    });

    it('should handle different action types', async () => {
      const actionTypes = [
        'USER_CREATED',
        'USER_UPDATED',
        'USER_DELETED',
        'INVOICE_CREATED',
        'TESTIMONIAL_UPDATED',
        'CALENDAR_EVENT_DELETED',
      ];

      mockCollection.mockReturnValue('adminLogs' as any);
      mockAddDoc.mockResolvedValue({ id: 'new-log-id' } as any);

      for (const action of actionTypes) {
        const logData = { ...mockLogData, action };
        await logAdminAction(logData as any);

        expect(mockAddDoc).toHaveBeenCalledWith('adminLogs', expect.objectContaining({
          action,
        }));
      }

      expect(mockAddDoc).toHaveBeenCalledTimes(actionTypes.length);
    });

    it('should handle different category types', async () => {
      const categories = ['auth', 'user', 'finance', 'content', 'system', 'security'];

      mockCollection.mockReturnValue('adminLogs' as any);
      mockAddDoc.mockResolvedValue({ id: 'new-log-id' } as any);

      for (const category of categories) {
        const logData = { ...mockLogData, category };
        await logAdminAction(logData as any);

        expect(mockAddDoc).toHaveBeenCalledWith('adminLogs', expect.objectContaining({
          category,
        }));
      }

      expect(mockAddDoc).toHaveBeenCalledTimes(categories.length);
    });

    it('should handle complex details objects', async () => {
      const complexDetails = {
        operation: 'bulk_update',
        affectedItems: ['item1', 'item2', 'item3'],
        metadata: {
          source: 'admin_panel',
          version: '1.2.3',
          flags: { experimental: true, beta: false },
        },
        counts: { created: 5, updated: 10, deleted: 2 },
      };

      const logDataWithComplexDetails = {
        ...mockLogData,
        details: complexDetails,
      };

      mockCollection.mockReturnValue('adminLogs' as any);
      mockAddDoc.mockResolvedValue({ id: 'new-log-id' } as any);

      await logAdminAction(logDataWithComplexDetails);

      expect(mockAddDoc).toHaveBeenCalledWith('adminLogs', expect.objectContaining({
        details: complexDetails,
      }));
    });

    it('should not modify the original log data object', async () => {
      const originalLogData = { ...mockLogData };
      delete (originalLogData as any).timestamp;

      mockCollection.mockReturnValue('adminLogs' as any);
      mockAddDoc.mockResolvedValue({ id: 'new-log-id' } as any);

      jest.spyOn(Date, 'now').mockReturnValue(1705305600000);

      await logAdminAction(originalLogData);

      // Original object should not have timestamp added
      expect(originalLogData).not.toHaveProperty('timestamp');

      Date.now = jest.fn().mockRestore();
    });
  });

  // Integration tests
  describe('integration scenarios', () => {
    it('should handle rapid successive log calls', async () => {
      mockCollection.mockReturnValue('adminLogs' as any);
      mockAddDoc.mockResolvedValue({ id: 'new-log-id' } as any);

      const promises = Array.from({ length: 5 }, (_, i) => 
        logAdminAction({
          ...mockLogData,
          action: `ACTION_${i}` as any,
          details: { index: i },
        })
      );

      await Promise.all(promises);

      expect(mockAddDoc).toHaveBeenCalledTimes(5);
    });

    it('should handle mixed success and failure scenarios', async () => {
      mockCollection.mockReturnValue('adminLogs' as any);
      
      // First call succeeds, second fails, third succeeds
      mockAddDoc
        .mockResolvedValueOnce({ id: 'log-1' } as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ id: 'log-3' } as any);

      await logAdminAction({ ...mockLogData, action: 'ACTION_1' as any });
      await logAdminAction({ ...mockLogData, action: 'ACTION_2' as any });
      await logAdminAction({ ...mockLogData, action: 'ACTION_3' as any });

      expect(mockAddDoc).toHaveBeenCalledTimes(3);
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to log admin action:',
        expect.any(Error)
      );
    });
  });
});
