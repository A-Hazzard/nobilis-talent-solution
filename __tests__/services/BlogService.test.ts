import { BlogService } from '@/lib/services/BlogService';
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

describe('BlogService', () => {
  let blogService: BlogService;

  beforeEach(() => {
    blogService = new BlogService();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all blog posts successfully', async () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Test Post 1',
          content: 'Content 1',
          excerpt: 'Excerpt 1',
          author: 'author1',
          authorName: 'Author 1',
          category: 'leadership',
          tags: ['leadership', 'management'],
          status: 'published',
          viewCount: 10,
          readTime: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Test Post 2',
          content: 'Content 2',
          excerpt: 'Excerpt 2',
          author: 'author2',
          authorName: 'Author 2',
          category: 'coaching',
          tags: ['coaching', 'development'],
          status: 'draft',
          viewCount: 5,
          readTime: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQuerySnapshot = {
        docs: mockPosts.map(post => ({
          id: post.id,
          data: () => ({
            ...post,
            createdAt: { toDate: () => post.createdAt },
            updatedAt: { toDate: () => post.updatedAt },
          }),
        })),
      };

      mockCollection.mockReturnValue('blogPosts' as any);
      mockQuery.mockReturnValue('query' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await blogService.getAll();

      expect(result.error).toBeUndefined();
      expect(result.posts).toHaveLength(2);
      expect(result.posts[0].title).toBe('Test Post 1');
      expect(result.posts[1].title).toBe('Test Post 2');
    });

    it('should handle search parameter', async () => {
      const mockQuerySnapshot = {
        docs: [],
      };

      mockCollection.mockReturnValue('blogPosts' as any);
      mockQuery.mockReturnValue('query' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      await blogService.getAll({ search: 'test' });

      expect(mockQuery).toHaveBeenCalledWith('blogPosts');
    });

    it('should handle category filter', async () => {
      const mockQuerySnapshot = {
        docs: [],
      };

      mockCollection.mockReturnValue('blogPosts' as any);
      mockQuery.mockReturnValue('query' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      await blogService.getAll({ category: 'leadership' });

      expect(mockQuery).toHaveBeenCalledWith('blogPosts');
    });

    it('should handle status filter', async () => {
      const mockQuerySnapshot = {
        docs: [],
      };

      mockCollection.mockReturnValue('blogPosts' as any);
      mockQuery.mockReturnValue('query' as any);
      mockWhere.mockReturnValue('where' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      await blogService.getAll({ status: 'published' });

      expect(mockWhere).toHaveBeenCalledWith('status', '==', 'published');
    });

    it('should handle error when fetching posts', async () => {
      mockCollection.mockReturnValue('blogPosts' as any);
      mockQuery.mockReturnValue('query' as any);
      mockGetDocs.mockRejectedValue(new Error('Database error'));

      const result = await blogService.getAll();

      expect(result.error).toBe('Failed to fetch blog posts');
      expect(result.posts).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should fetch a blog post by ID successfully', async () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        content: 'Test Content',
        excerpt: 'Test Excerpt',
        author: 'author1',
        authorName: 'Author 1',
        category: 'leadership',
        tags: ['leadership'],
        status: 'published',
        viewCount: 10,
        readTime: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockDocSnapshot = {
        exists: () => true,
        id: '1',
        data: () => ({
          ...mockPost,
          createdAt: { toDate: () => mockPost.createdAt },
          updatedAt: { toDate: () => mockPost.updatedAt },
        }),
      };

      mockDoc.mockReturnValue('doc-ref' as any);
      mockGetDoc.mockResolvedValue(mockDocSnapshot as any);

      const result = await blogService.getById('1');

      expect(result.error).toBeUndefined();
      expect(result.post).toEqual(mockPost);
    });

    it('should handle post not found', async () => {
      const mockDocSnapshot = {
        exists: () => false,
      };

      mockDoc.mockReturnValue('doc-ref' as any);
      mockGetDoc.mockResolvedValue(mockDocSnapshot as any);

      const result = await blogService.getById('999');

      expect(result.error).toBe('Blog post not found');
      expect(result.post).toBeNull();
    });

    it('should handle error when fetching post', async () => {
      mockDoc.mockReturnValue('doc-ref' as any);
      mockGetDoc.mockRejectedValue(new Error('Database error'));

      const result = await blogService.getById('1');

      expect(result.error).toBe('Failed to fetch blog post');
      expect(result.post).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a blog post successfully', async () => {
      const postData = {
        title: 'New Post',
        content: 'New Content',
        excerpt: 'New Excerpt',
        author: 'author1',
        authorName: 'Author 1',
        category: 'leadership',
        tags: ['leadership'],
        status: 'draft' as const,
      };

      mockCollection.mockReturnValue('blogPosts' as any);
      mockAddDoc.mockResolvedValue({ id: 'new-post-id' } as any);
      mockServerTimestamp.mockReturnValue('timestamp' as any);

      const result = await blogService.create(postData);

      expect(result.error).toBeUndefined();
      expect(result.id).toBe('new-post-id');
      expect(mockAddDoc).toHaveBeenCalledWith(
        'blogPosts',
        expect.objectContaining({
          title: 'New Post',
          content: 'New Content',
        })
      );
    });

    it('should handle error when creating post', async () => {
      const postData = {
        title: 'New Post',
        content: 'New Content',
        excerpt: 'New Excerpt',
        author: 'author1',
        authorName: 'Author 1',
        category: 'leadership',
        tags: ['leadership'],
        status: 'draft' as const,
      };

      mockCollection.mockReturnValue('blogPosts' as any);
      mockAddDoc.mockRejectedValue(new Error('Database error'));

      const result = await blogService.create(postData);

      expect(result.error).toBe('Failed to create blog post');
      expect(result.id).toBe('');
    });
  });

  describe('update', () => {
    it('should update a blog post successfully', async () => {
      const postId = '1';
      const updateData = {
        title: 'Updated Post',
        content: 'Updated Content',
      };

      const mockPost = {
        id: '1',
        title: 'Original Post',
        content: 'Original Content',
        excerpt: 'Original Excerpt',
        author: 'author1',
        authorName: 'Author 1',
        category: 'leadership',
        tags: ['leadership'],
        status: 'draft',
        viewCount: 10,
        readTime: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockDocSnapshot = {
        exists: () => true,
        id: '1',
        data: () => ({
          ...mockPost,
          createdAt: { toDate: () => mockPost.createdAt },
          updatedAt: { toDate: () => mockPost.updatedAt },
        }),
      };

      mockDoc.mockReturnValue('doc-ref' as any);
      mockGetDoc.mockResolvedValue(mockDocSnapshot as any);
      mockUpdateDoc.mockResolvedValue(undefined);
      mockServerTimestamp.mockReturnValue('timestamp' as any);

      const result = await blogService.update(postId, updateData);

      expect(result.error).toBeUndefined();
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'doc-ref',
        expect.objectContaining({
          title: 'Updated Post',
          content: 'Updated Content',
        })
      );
    });

    it('should handle error when updating post', async () => {
      const postId = '1';
      const updateData = {
        title: 'Updated Post',
      };

      mockDoc.mockReturnValue('doc-ref' as any);
      mockGetDoc.mockRejectedValue(new Error('Database error'));

      const result = await blogService.update(postId, updateData);

      expect(result.error).toBe('Blog post not found');
    });
  });

  describe('delete', () => {
    it('should delete a blog post successfully', async () => {
      const postId = '1';

      const mockPost = {
        id: '1',
        title: 'Test Post',
        content: 'Test Content',
        excerpt: 'Test Excerpt',
        author: 'author1',
        authorName: 'Author 1',
        category: 'leadership',
        tags: ['leadership'],
        status: 'draft',
        viewCount: 10,
        readTime: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockDocSnapshot = {
        exists: () => true,
        id: '1',
        data: () => ({
          ...mockPost,
          createdAt: { toDate: () => mockPost.createdAt },
          updatedAt: { toDate: () => mockPost.updatedAt },
        }),
      };

      mockDoc.mockReturnValue('doc-ref' as any);
      mockGetDoc.mockResolvedValue(mockDocSnapshot as any);
      mockDeleteDoc.mockResolvedValue(undefined);

      const result = await blogService.delete(postId);

      expect(result.error).toBeUndefined();
      expect(mockDeleteDoc).toHaveBeenCalledWith('doc-ref');
    });

    it('should handle error when deleting post', async () => {
      const postId = '1';

      mockDoc.mockReturnValue('doc-ref' as any);
      mockGetDoc.mockRejectedValue(new Error('Database error'));

      const result = await blogService.delete(postId);

      expect(result.error).toBe('Blog post not found');
    });
  });

  describe('incrementViewCount', () => {
    it('should increment view count successfully', async () => {
      const postId = '1';

      mockDoc.mockReturnValue('doc-ref' as any);
      mockUpdateDoc.mockResolvedValue(undefined);
      mockIncrement.mockReturnValue('increment' as any);

      const result = await blogService.incrementViewCount(postId);

      expect(result.error).toBeUndefined();
      expect(mockUpdateDoc).toHaveBeenCalledWith('doc-ref', {
        viewCount: 'increment',
      });
    });

    it('should handle error when incrementing view count', async () => {
      const postId = '1';

      mockDoc.mockReturnValue('doc-ref' as any);
      mockUpdateDoc.mockRejectedValue(new Error('Database error'));

      const result = await blogService.incrementViewCount(postId);

      expect(result.error).toBe('Failed to update view count');
    });
  });

  describe('getPublishedPosts', () => {
    it('should fetch published posts successfully', async () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Published Post',
          content: 'Content',
          excerpt: 'Excerpt',
          author: 'author1',
          authorName: 'Author 1',
          category: 'leadership',
          tags: ['leadership'],
          status: 'published',
          viewCount: 10,
          readTime: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQuerySnapshot = {
        docs: mockPosts.map(post => ({
          id: post.id,
          data: () => ({
            ...post,
            createdAt: { toDate: () => post.createdAt },
            updatedAt: { toDate: () => post.updatedAt },
          }),
        })),
      };

      mockCollection.mockReturnValue('blogPosts' as any);
      mockQuery.mockReturnValue('query' as any);
      mockWhere.mockReturnValue('where' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await blogService.getPublishedPosts(10);

      expect(result.error).toBeUndefined();
      expect(result.posts).toHaveLength(1);
      expect(mockWhere).toHaveBeenCalledWith('status', '==', 'published');
    });
  });

  describe('getStats', () => {
    it('should fetch blog statistics successfully', async () => {
      const mockPosts = [
        {
          id: '1',
          status: 'published',
          viewCount: 10,
          category: 'leadership',
        },
        {
          id: '2',
          status: 'draft',
          viewCount: 5,
          category: 'coaching',
        },
      ];

      const mockQuerySnapshot = {
        docs: mockPosts.map(post => ({
          id: post.id,
          data: () => post,
        })),
      };

      mockCollection.mockReturnValue('blogPosts' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await blogService.getStats();

      expect(result.error).toBeUndefined();
      expect(result.total).toBe(2);
      expect(result.published).toBe(1);
      expect(result.draft).toBe(1);
      expect(result.totalViews).toBe(15);
      expect(result.byCategory).toEqual({
        leadership: 1,
        coaching: 1,
      });
    });

    it('should handle error when fetching stats', async () => {
      mockCollection.mockReturnValue('blogPosts' as any);
      mockGetDocs.mockRejectedValue(new Error('Database error'));

      const result = await blogService.getStats();

      expect(result.error).toBe('Failed to fetch blog statistics');
      expect(result.total).toBe(0);
    });
  });
});
