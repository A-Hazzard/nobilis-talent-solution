import { ResourcesService } from '@/lib/services/ResourcesService';
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
  increment,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

// Mock Firebase modules
jest.mock('firebase/firestore');
jest.mock('firebase/storage');
jest.mock('@/lib/firebase/config', () => ({
  db: {},
  storage: {},
}));
jest.mock('@/lib/helpers/auditLogger', () => ({
  logAdminAction: jest.fn(),
}));

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
const mockIncrement = increment as jest.MockedFunction<typeof increment>;

const mockRef = ref as jest.MockedFunction<typeof ref>;
const mockUploadBytes = uploadBytes as jest.MockedFunction<typeof uploadBytes>;
const mockGetDownloadURL = getDownloadURL as jest.MockedFunction<typeof getDownloadURL>;
const mockDeleteObject = deleteObject as jest.MockedFunction<typeof deleteObject>;

describe('ResourcesService', () => {
  let resourcesService: ResourcesService;

  beforeEach(() => {
    resourcesService = new ResourcesService();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all resources successfully', async () => {
      const mockResources = [
        {
          id: '1',
          title: 'Test Resource 1',
          description: 'Description 1',
          type: 'pdf' as const,
          category: 'leadership' as const,
          fileUrl: 'https://example.com/file1.pdf',
          fileSize: 1024,
          downloadCount: 10,
          isPublic: true,
          createdBy: 'user1',
          tags: ['leadership', 'management'],
          featured: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Test Resource 2',
          description: 'Description 2',
          type: 'docx' as const,
          category: 'coaching' as const,
          fileUrl: 'https://example.com/file2.docx',
          fileSize: 2048,
          downloadCount: 5,
          isPublic: false,
          createdBy: 'user2',
          tags: ['coaching', 'development'],
          featured: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQuerySnapshot = {
        docs: mockResources.map(resource => ({
          id: resource.id,
          data: () => ({
            ...resource,
            createdAt: { toDate: () => resource.createdAt },
            updatedAt: { toDate: () => resource.updatedAt },
          }),
        })),
      };

      mockCollection.mockReturnValue('resources' as any);
      mockQuery.mockReturnValue('query' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await resourcesService.getAll();

      expect(result.error).toBeUndefined();
      expect(result.resources).toHaveLength(2);
      expect(result.resources[0].title).toBe('Test Resource 1');
      expect(result.resources[1].title).toBe('Test Resource 2');
    });

    it('should handle search parameter', async () => {
      const mockQuerySnapshot = {
        docs: [],
      };

      mockCollection.mockReturnValue('resources' as any);
      mockQuery.mockReturnValue('query' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      await resourcesService.getAll({ search: 'test' });

      expect(mockQuery).toHaveBeenCalledWith('resources');
    });

    it('should handle category filter', async () => {
      const mockQuerySnapshot = {
        docs: [],
      };

      mockCollection.mockReturnValue('resources' as any);
      mockQuery.mockReturnValue('query' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      await resourcesService.getAll({ category: 'leadership' });

      expect(mockQuery).toHaveBeenCalledWith('resources');
    });

    it('should handle type filter', async () => {
      const mockQuerySnapshot = {
        docs: [],
      };

      mockCollection.mockReturnValue('resources' as any);
      mockQuery.mockReturnValue('query' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      await resourcesService.getAll({ type: 'pdf' });

      expect(mockQuery).toHaveBeenCalledWith('resources');
    });

    it('should handle error when fetching resources', async () => {
      mockCollection.mockReturnValue('resources' as any);
      mockQuery.mockReturnValue('query' as any);
      mockGetDocs.mockRejectedValue(new Error('Database error'));

      const result = await resourcesService.getAll();

      expect(result.error).toBe('Failed to fetch resources');
      expect(result.resources).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should fetch a resource by ID successfully', async () => {
      const mockResource = {
        id: '1',
        title: 'Test Resource',
        description: 'Test Description',
        type: 'pdf' as const,
        category: 'leadership' as const,
        fileUrl: 'https://example.com/file.pdf',
        fileSize: 1024,
        downloadCount: 10,
        isPublic: true,
        createdBy: 'user1',
        tags: ['leadership'],
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockDocSnapshot = {
        exists: () => true,
        id: '1',
        data: () => ({
          ...mockResource,
          createdAt: { toDate: () => mockResource.createdAt },
          updatedAt: { toDate: () => mockResource.updatedAt },
        }),
      };

      mockDoc.mockReturnValue('doc-ref' as any);
      mockGetDoc.mockResolvedValue(mockDocSnapshot as any);

      const result = await resourcesService.getById('1');

      expect(result.error).toBeUndefined();
      expect(result.resource).toEqual(mockResource);
    });

    it('should handle resource not found', async () => {
      const mockDocSnapshot = {
        exists: () => false,
      };

      mockDoc.mockReturnValue('doc-ref' as any);
      mockGetDoc.mockResolvedValue(mockDocSnapshot as any);

      const result = await resourcesService.getById('999');

      expect(result.error).toBe('Resource not found');
      expect(result.resource).toBeNull();
    });

    it('should handle error when fetching resource', async () => {
      mockDoc.mockReturnValue('doc-ref' as any);
      mockGetDoc.mockRejectedValue(new Error('Database error'));

      const result = await resourcesService.getById('1');

      expect(result.error).toBe('Failed to fetch resource');
      expect(result.resource).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a resource successfully with file upload', async () => {
      const resourceData = {
        title: 'New Resource',
        description: 'New Description',
        type: 'pdf' as const,
        category: 'leadership' as const,
        isPublic: true,
        createdBy: 'user1',
        tags: ['leadership'],
        featured: false,
      };

      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

      mockCollection.mockReturnValue('resources' as any);
      mockAddDoc.mockResolvedValue({ id: 'new-resource-id' } as any);
      mockServerTimestamp.mockReturnValue('timestamp' as any);
      mockRef.mockReturnValue('storage-ref' as any);
      mockUploadBytes.mockResolvedValue({ ref: { bucket: 'test-bucket' } } as any);
      mockGetDownloadURL.mockResolvedValue('https://example.com/file.pdf');

      const result = await resourcesService.create(resourceData, mockFile);

      expect(result.error).toBeUndefined();
      expect(result.id).toBe('new-resource-id');
      expect(mockAddDoc).toHaveBeenCalledWith(
        'resources',
        expect.objectContaining({
          title: 'New Resource',
          description: 'New Description',
        })
      );
    });

    it('should create a resource without file upload (video type)', async () => {
      const resourceData = {
        title: 'Video Resource',
        description: 'Video Description',
        type: 'video' as const,
        category: 'coaching' as const,
        fileUrl: 'https://youtube.com/watch?v=123',
        isPublic: true,
        createdBy: 'user1',
        tags: ['coaching'],
        featured: false,
      };

      mockCollection.mockReturnValue('resources' as any);
      mockAddDoc.mockResolvedValue({ id: 'new-resource-id' } as any);
      mockServerTimestamp.mockReturnValue('timestamp' as any);

      const result = await resourcesService.create(resourceData);

      expect(result.error).toBeUndefined();
      expect(result.id).toBe('new-resource-id');
      expect(mockAddDoc).toHaveBeenCalledWith(
        'resources',
        expect.objectContaining({
          title: 'Video Resource',
          description: 'Video Description',
        })
      );
    });

    it('should handle error when creating resource', async () => {
      const resourceData = {
        title: 'New Resource',
        description: 'New Description',
        type: 'pdf' as const,
        category: 'leadership' as const,
        isPublic: true,
        createdBy: 'user1',
        tags: ['leadership'],
        featured: false,
      };

      mockCollection.mockReturnValue('resources' as any);
      mockAddDoc.mockRejectedValue(new Error('Database error'));

      const result = await resourcesService.create(resourceData);

      expect(result.error).toBe('Failed to create resource');
      expect(result.id).toBe('');
    });

    it('should handle file upload error', async () => {
      const resourceData = {
        title: 'New Resource',
        description: 'New Description',
        type: 'pdf' as const,
        category: 'leadership' as const,
        isPublic: true,
        createdBy: 'user1',
        tags: ['leadership'],
        featured: false,
      };

      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

      mockRef.mockReturnValue('storage-ref' as any);
      mockUploadBytes.mockRejectedValue(new Error('Upload error'));

      const result = await resourcesService.create(resourceData, mockFile);

      expect(result.error).toBe('Failed to upload file');
      expect(result.id).toBe('');
    });
  });

  describe('update', () => {
    it('should update a resource successfully', async () => {
      const resourceId = '1';
      const updateData = {
        title: 'Updated Resource',
        description: 'Updated Description',
      };

      const mockResource = {
        id: '1',
        title: 'Original Resource',
        description: 'Original Description',
        type: 'pdf' as const,
        category: 'leadership' as const,
        fileUrl: 'https://example.com/file.pdf',
        fileSize: 1024,
        downloadCount: 10,
        isPublic: true,
        createdBy: 'user1',
        tags: ['leadership'],
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockDocSnapshot = {
        exists: () => true,
        id: '1',
        data: () => ({
          ...mockResource,
          createdAt: { toDate: () => mockResource.createdAt },
          updatedAt: { toDate: () => mockResource.updatedAt },
        }),
      };

      mockDoc.mockReturnValue('doc-ref' as any);
      mockGetDoc.mockResolvedValue(mockDocSnapshot as any);
      mockUpdateDoc.mockResolvedValue(undefined);
      mockServerTimestamp.mockReturnValue('timestamp' as any);

      const result = await resourcesService.update(resourceId, updateData);

      expect(result.error).toBeUndefined();
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'doc-ref',
        expect.objectContaining({
          title: 'Updated Resource',
          description: 'Updated Description',
        })
      );
    });

    it('should update a resource with file upload', async () => {
      const resourceId = '1';
      const updateData = {
        title: 'Updated Resource',
      };

      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

      const mockResource = {
        id: '1',
        title: 'Original Resource',
        description: 'Original Description',
        type: 'pdf' as const,
        category: 'leadership' as const,
        fileUrl: 'https://example.com/old-file.pdf',
        fileSize: 1024,
        downloadCount: 10,
        isPublic: true,
        createdBy: 'user1',
        tags: ['leadership'],
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockDocSnapshot = {
        exists: () => true,
        id: '1',
        data: () => ({
          ...mockResource,
          createdAt: { toDate: () => mockResource.createdAt },
          updatedAt: { toDate: () => mockResource.updatedAt },
        }),
      };

      mockDoc.mockReturnValue('doc-ref' as any);
      mockGetDoc.mockResolvedValue(mockDocSnapshot as any);
      mockUpdateDoc.mockResolvedValue(undefined);
      mockServerTimestamp.mockReturnValue('timestamp' as any);
      mockRef.mockReturnValue('storage-ref' as any);
      mockUploadBytes.mockResolvedValue({ ref: { bucket: 'test-bucket' } } as any);
      mockGetDownloadURL.mockResolvedValue('https://example.com/new-file.pdf');

      const result = await resourcesService.update(resourceId, updateData, mockFile);

      expect(result.error).toBeUndefined();
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'doc-ref',
        expect.objectContaining({
          title: 'Updated Resource',
        })
      );
    });

    it('should handle error when updating resource', async () => {
      const resourceId = '1';
      const updateData = {
        title: 'Updated Resource',
      };

      mockDoc.mockReturnValue('doc-ref' as any);
      mockGetDoc.mockRejectedValue(new Error('Database error'));

            const result = await resourcesService.update(resourceId, updateData);      

      expect(result.error).toBe('Resource not found');
    });
  });

  describe('delete', () => {
    it('should delete a resource successfully', async () => {
      const resourceId = '1';

      const mockResource = {
        id: '1',
        title: 'Test Resource',
        description: 'Test Description',
        type: 'pdf' as const,
        category: 'leadership' as const,
        fileUrl: 'https://example.com/file.pdf',
        fileSize: 1024,
        downloadCount: 10,
        isPublic: true,
        createdBy: 'user1',
        tags: ['leadership'],
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockDocSnapshot = {
        exists: () => true,
        id: '1',
        data: () => ({
          ...mockResource,
          createdAt: { toDate: () => mockResource.createdAt },
          updatedAt: { toDate: () => mockResource.updatedAt },
        }),
      };

      mockDoc.mockReturnValue('doc-ref' as any);
      mockGetDoc.mockResolvedValue(mockDocSnapshot as any);
      mockDeleteDoc.mockResolvedValue(undefined);
      mockRef.mockReturnValue('storage-ref' as any);
      mockDeleteObject.mockResolvedValue(undefined);

      const result = await resourcesService.delete(resourceId);

      expect(result.error).toBeUndefined();
      expect(mockDeleteDoc).toHaveBeenCalledWith('doc-ref');
    });

    it('should handle error when deleting resource', async () => {
      const resourceId = '1';

      mockDoc.mockReturnValue('doc-ref' as any);
      mockGetDoc.mockRejectedValue(new Error('Database error'));

      const result = await resourcesService.delete(resourceId);

      expect(result.error).toBe('Resource not found');
    });
  });

  describe('incrementDownloadCount', () => {
    it('should increment download count successfully', async () => {
      const resourceId = '1';

      mockDoc.mockReturnValue('doc-ref' as any);
      mockUpdateDoc.mockResolvedValue(undefined);
      mockIncrement.mockReturnValue('increment' as any);

      const result = await resourcesService.incrementDownloadCount(resourceId);

      expect(result.error).toBeUndefined();
      expect(mockUpdateDoc).toHaveBeenCalledWith('doc-ref', {
        downloadCount: 'increment',
      });
    });

    it('should handle error when incrementing download count', async () => {
      const resourceId = '1';

      mockDoc.mockReturnValue('doc-ref' as any);
      mockUpdateDoc.mockRejectedValue(new Error('Database error'));

      const result = await resourcesService.incrementDownloadCount(resourceId);

      expect(result.error).toBe('Failed to update download count');
    });
  });

  describe('getPublicResources', () => {
    it('should fetch public resources successfully', async () => {
      const mockResources = [
        {
          id: '1',
          title: 'Public Resource',
          description: 'Public Description',
          type: 'pdf' as const,
          category: 'leadership' as const,
          fileUrl: 'https://example.com/file.pdf',
          fileSize: 1024,
          downloadCount: 10,
          isPublic: true,
          createdBy: 'user1',
          tags: ['leadership'],
          featured: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQuerySnapshot = {
        docs: mockResources.map(resource => ({
          id: resource.id,
          data: () => ({
            ...resource,
            createdAt: { toDate: () => resource.createdAt },
            updatedAt: { toDate: () => resource.updatedAt },
          }),
        })),
      };

      mockCollection.mockReturnValue('resources' as any);
      mockQuery.mockReturnValue('query' as any);
      mockWhere.mockReturnValue('where' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await resourcesService.getPublicResources(10);

      expect(result.error).toBeUndefined();
      expect(result.resources).toHaveLength(1);
      expect(mockWhere).toHaveBeenCalledWith('isPublic', '==', true);
    });
  });

  describe('getStats', () => {
    it('should fetch resource statistics successfully', async () => {
      const mockResources = [
        {
          id: '1',
          downloadCount: 10,
          category: 'leadership',
        },
        {
          id: '2',
          downloadCount: 5,
          category: 'coaching',
        },
      ];

      const mockQuerySnapshot = {
        docs: mockResources.map(resource => ({
          id: resource.id,
          data: () => resource,
        })),
      };

      mockCollection.mockReturnValue('resources' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await resourcesService.getStats();

      expect(result.error).toBeUndefined();
      expect(result.total).toBe(2);
      expect(result.totalDownloads).toBe(15);
      expect(result.byCategory).toEqual({
        leadership: 1,
        coaching: 1,
      });
    });

    it('should handle error when fetching stats', async () => {
      mockCollection.mockReturnValue('resources' as any);
      mockGetDocs.mockRejectedValue(new Error('Database error'));

      const result = await resourcesService.getStats();

      expect(result.error).toBe('Failed to fetch resource statistics');
      expect(result.total).toBe(0);
    });
  });
});
