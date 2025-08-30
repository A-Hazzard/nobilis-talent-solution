import { TestimonialsService } from '@/lib/services/TestimonialsService';
import type { Testimonial } from '@/shared/types/entities';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { logAdminAction } from '@/lib/helpers/auditLogger';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  limit: jest.fn(),
  serverTimestamp: jest.fn(),
}));

jest.mock('@/lib/firebase/config', () => ({
  db: {},
}));

jest.mock('@/lib/helpers/auditLogger');

const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockWhere = where as jest.MockedFunction<typeof where>;
const mockLimit = limit as jest.MockedFunction<typeof limit>;
const mockServerTimestamp = serverTimestamp as jest.MockedFunction<typeof serverTimestamp>;
const mockLogAdminAction = logAdminAction as jest.MockedFunction<typeof logAdminAction>;

describe('TestimonialsService', () => {
  let testimonialsService: TestimonialsService;

  beforeEach(() => {
    jest.clearAllMocks();
    testimonialsService = TestimonialsService.getInstance();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = TestimonialsService.getInstance();
      const instance2 = TestimonialsService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getAll', () => {
    it('should fetch all testimonials successfully', async () => {
      const mockTestimonials = [
        {
          id: 'test-1',
          clientName: 'John Doe',
          company: 'Acme Corp',
          content: 'Great service!',
          isPublic: true,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          id: 'test-2',
          clientName: 'Jane Smith',
          company: 'Tech Inc',
          content: 'Excellent work!',
          isPublic: true,
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-20'),
        },
      ];

      const mockQuerySnapshot = {
        docs: mockTestimonials.map(testimonial => ({
          id: testimonial.id,
          data: () => ({
            ...testimonial,
            createdAt: { toDate: () => testimonial.createdAt },
            updatedAt: { toDate: () => testimonial.updatedAt },
          }),
        })),
      };

      mockCollection.mockReturnValue('testimonials' as any);
      mockQuery.mockReturnValue('query' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await testimonialsService.getAll();

      expect(result.error).toBeUndefined();
      expect(result.testimonials).toHaveLength(2);
      expect(result.testimonials[0].clientName).toBe('Jane Smith'); // Sorted by date (newest first)
    });

    it('should filter by isPublic when provided', async () => {
      const mockQuerySnapshot = { docs: [] };

      mockCollection.mockReturnValue('testimonials' as any);
      mockQuery.mockReturnValue('query' as any);
      mockWhere.mockReturnValue('where' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      await testimonialsService.getAll({ isPublic: true });

      expect(mockWhere).toHaveBeenCalledWith('isPublic', '==', true);
    });

    it('should apply search filter', async () => {
      const mockTestimonials = [
        {
          id: 'test-1',
          clientName: 'John Doe',
          company: 'Acme Corp',
          content: 'Great service!',
          isPublic: true,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          id: 'test-2',
          clientName: 'Jane Smith',
          company: 'Tech Inc',
          content: 'Excellent work!',
          isPublic: true,
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-20'),
        },
      ];

      const mockQuerySnapshot = {
        docs: mockTestimonials.map(testimonial => ({
          id: testimonial.id,
          data: () => ({
            ...testimonial,
            createdAt: { toDate: () => testimonial.createdAt },
            updatedAt: { toDate: () => testimonial.updatedAt },
          }),
        })),
      };

      mockCollection.mockReturnValue('testimonials' as any);
      mockQuery.mockReturnValue('query' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await testimonialsService.getAll({ search: 'acme' });

      expect(result.testimonials).toHaveLength(1);
      expect(result.testimonials[0].company).toBe('Acme Corp');
    });

    it('should handle fetch errors', async () => {
      mockCollection.mockReturnValue('testimonials' as any);
      mockQuery.mockReturnValue('query' as any);
      mockGetDocs.mockRejectedValue(new Error('Firebase error'));

      const result = await testimonialsService.getAll();

      expect(result.error).toBe('Failed to fetch testimonials');
      expect(result.testimonials).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should get testimonial by ID successfully', async () => {
      const mockTestimonial = {
        id: 'test-1',
        clientName: 'John Doe',
        company: 'Acme Corp',
        content: 'Great service!',
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDoc.mockReturnValue('doc-ref' as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: 'test-1',
        data: () => ({
          ...mockTestimonial,
          createdAt: { toDate: () => mockTestimonial.createdAt },
          updatedAt: { toDate: () => mockTestimonial.updatedAt },
        }),
      } as any);

      const result = await testimonialsService.getById('test-1');

      expect(result.error).toBeUndefined();
      expect(result.testimonial?.id).toBe('test-1');
      expect(result.testimonial?.clientName).toBe('John Doe');
    });

    it('should handle testimonial not found', async () => {
      mockDoc.mockReturnValue('doc-ref' as any);
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await testimonialsService.getById('non-existent');

      expect(result.testimonial).toBeNull();
      expect(result.error).toBe('Testimonial not found');
    });

    it('should handle fetch errors', async () => {
      mockDoc.mockReturnValue('doc-ref' as any);
      mockGetDoc.mockRejectedValue(new Error('Firebase error'));

      const result = await testimonialsService.getById('test-1');

      expect(result.testimonial).toBeNull();
      expect(result.error).toBe('Failed to fetch testimonial');
    });
  });

  describe('create', () => {
    const mockCreateData = {
      clientName: 'John Doe',
      company: 'Acme Corp',
      content: 'Great service!',
      rating: 5 as const,
      isPublic: true,
    };

    it('should create testimonial successfully', async () => {
      const mockDocRef = { id: 'new-testimonial-id' };
      const mockTimestamp = new Date();

      mockCollection.mockReturnValue('testimonials' as any);
      mockServerTimestamp.mockReturnValue(mockTimestamp);
      mockAddDoc.mockResolvedValue(mockDocRef as any);

      const result = await testimonialsService.create(mockCreateData);

      expect(result.error).toBeUndefined();
      expect(result.id).toBe('new-testimonial-id');
      expect(mockAddDoc).toHaveBeenCalledWith(
        'testimonials',
        expect.objectContaining({
          ...mockCreateData,
          createdAt: mockTimestamp,
          updatedAt: mockTimestamp,
        })
      );
      expect(mockLogAdminAction).toHaveBeenCalled();
    });

    it('should handle creation errors', async () => {
      mockCollection.mockReturnValue('testimonials' as any);
      mockServerTimestamp.mockReturnValue(new Date());
      mockAddDoc.mockRejectedValue(new Error('Firebase error'));

      const result = await testimonialsService.create(mockCreateData);

      expect(result.error).toBe('Failed to create testimonial');
      expect(result.id).toBe('');
    });
  });

  describe('update', () => {
    const mockUpdateData = {
      clientName: 'Jane Doe',
      content: 'Updated content',
      isPublic: false,
    };

    it('should update testimonial successfully', async () => {
      const mockTimestamp = new Date();
      
      // Mock getById to return a testimonial (not null)
      const existingTestimonial = {
        id: 'test-1',
        clientName: 'Existing Client',
        content: 'Existing content',
        rating: 4,
        isPublic: true,
        company: 'Existing Corp',
        serviceType: 'leadership',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      jest.spyOn(testimonialsService, 'getById').mockResolvedValue({
        testimonial: existingTestimonial,
      });

      mockDoc.mockReturnValue('doc-ref' as any);
      mockServerTimestamp.mockReturnValue(mockTimestamp);
      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await testimonialsService.update('test-1', mockUpdateData);

      expect(result.error).toBeUndefined();
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'doc-ref',
        expect.objectContaining({
          ...mockUpdateData,
          updatedAt: mockTimestamp,
        })
      );
      expect(mockLogAdminAction).toHaveBeenCalled();
    });

    it('should handle update errors', async () => {
      mockDoc.mockReturnValue('doc-ref' as any);
      mockServerTimestamp.mockReturnValue(new Date());
      mockUpdateDoc.mockRejectedValue(new Error('Firebase error'));

      const result = await testimonialsService.update('test-1', mockUpdateData);

      expect(result.error).toBe('Failed to update testimonial');
    });
  });

  describe('delete', () => {
    it('should delete testimonial successfully', async () => {
      // Mock getById to return a testimonial (not null)
      const existingTestimonial = {
        id: 'test-1',
        clientName: 'Existing Client',
        content: 'Existing content',
        rating: 4,
        isPublic: true,
        company: 'Existing Corp',
        serviceType: 'leadership',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      jest.spyOn(testimonialsService, 'getById').mockResolvedValue({
        testimonial: existingTestimonial,
      });
      
      mockDoc.mockReturnValue('doc-ref' as any);
      mockDeleteDoc.mockResolvedValue(undefined);

      const result = await testimonialsService.delete('test-1');

      expect(result.error).toBeUndefined();
      expect(mockDeleteDoc).toHaveBeenCalledWith('doc-ref');
      expect(mockLogAdminAction).toHaveBeenCalled();
    });

    it('should handle delete errors', async () => {
      mockDoc.mockReturnValue('doc-ref' as any);
      mockDeleteDoc.mockRejectedValue(new Error('Firebase error'));

      const result = await testimonialsService.delete('test-1');

      expect(result.error).toBe('Failed to delete testimonial');
    });
  });

  describe('getPublic', () => {
    it('should get only public testimonials', async () => {
      const mockTestimonials = [
        {
          id: 'test-1',
          clientName: 'John Doe',
          company: 'Acme Corp',
          content: 'Great service!',
          isPublic: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQuerySnapshot = {
        docs: mockTestimonials.map(testimonial => ({
          id: testimonial.id,
          data: () => ({
            ...testimonial,
            createdAt: { toDate: () => testimonial.createdAt },
            updatedAt: { toDate: () => testimonial.updatedAt },
          }),
        })),
      };

      mockCollection.mockReturnValue('testimonials' as any);
      mockQuery.mockReturnValue('query' as any);
      mockWhere.mockReturnValue('where' as any);
      mockLimit.mockReturnValue('limit' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await testimonialsService.getPublicTestimonials(10);

      expect(result.error).toBeUndefined();
      expect(result.testimonials).toHaveLength(1);
      expect(mockWhere).toHaveBeenCalledWith('isPublic', '==', true);
      expect(mockLimit).toHaveBeenCalledWith(20);
    });
  });

  describe('getStats', () => {
    it('should handle stats fetch errors', async () => {
      mockCollection.mockReturnValue('testimonials' as any);
      mockQuery.mockReturnValue('query' as any);
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      const result = await testimonialsService.getStats();

      expect(result.error).toBe('Failed to fetch testimonial statistics');
      expect(result.total).toBe(0);
    });

    it('should handle stats fetch errors', async () => {
      mockCollection.mockReturnValue('testimonials' as any);
      mockQuery.mockReturnValue('query' as any);
      mockGetDocs.mockRejectedValue(new Error('Firebase error'));

      const result = await testimonialsService.getStats();

      expect(result.total).toBe(0);
      expect(result.error).toBe('Failed to fetch testimonial statistics');
    });
  });
});
