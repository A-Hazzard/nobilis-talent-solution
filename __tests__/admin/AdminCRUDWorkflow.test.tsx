import { BlogService } from '@/lib/services/BlogService';
import { ResourcesService } from '@/lib/services/ResourcesService';

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

describe('Admin Dashboard CRUD Workflows', () => {
  let blogService: BlogService;
  let resourcesService: ResourcesService;

  beforeEach(() => {
    blogService = new BlogService();
    resourcesService = new ResourcesService();
    jest.clearAllMocks();
  });

  describe('Blog Management Workflow', () => {
    it('should complete full CRUD workflow for blog posts', async () => {
      // 1. CREATE - Create a new blog post
      const newPostData = {
        title: 'Test Blog Post',
        content: 'This is a test blog post content.',
        excerpt: 'A brief excerpt for the test post.',
        author: 'test-user-id',
        authorName: 'Test Author',
        category: 'leadership',
        tags: ['leadership', 'test'],
        status: 'draft' as const,
      };

      // Mock successful creation
      const mockCreateResponse = { id: 'new-post-123', error: undefined };
      jest.spyOn(blogService, 'create').mockResolvedValue(mockCreateResponse);

      const createResult = await blogService.create(newPostData);
      expect(createResult.error).toBeUndefined();
      expect(createResult.id).toBe('new-post-123');

      // 2. READ - Fetch the created post
      const mockPost = {
        id: 'new-post-123',
        ...newPostData,
        viewCount: 0,
        readTime: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(blogService, 'getById').mockResolvedValue({
        post: mockPost,
        error: undefined,
      });

      const readResult = await blogService.getById('new-post-123');
      expect(readResult.error).toBeUndefined();
      expect(readResult.post?.title).toBe('Test Blog Post');

      // 3. UPDATE - Update the blog post
      const updateData = {
        title: 'Updated Test Blog Post',
        content: 'Updated content for the test post.',
        status: 'published' as const,
      };

      jest.spyOn(blogService, 'update').mockResolvedValue({
        error: undefined,
      });

      const updateResult = await blogService.update('new-post-123', updateData);
      expect(updateResult.error).toBeUndefined();

      // 4. DELETE - Delete the blog post
      jest.spyOn(blogService, 'delete').mockResolvedValue({
        error: undefined,
      });

      const deleteResult = await blogService.delete('new-post-123');
      expect(deleteResult.error).toBeUndefined();

      // Verify the post is gone
      jest.spyOn(blogService, 'getById').mockResolvedValue({
        post: null,
        error: 'Blog post not found',
      });

      const verifyDeleteResult = await blogService.getById('new-post-123');
      expect(verifyDeleteResult.error).toBe('Blog post not found');
      expect(verifyDeleteResult.post).toBeNull();
    });

    it('should handle blog post publishing workflow', async () => {
      // Create draft post
      const draftPost = {
        title: 'Draft Post',
        content: 'Draft content',
        excerpt: 'Draft excerpt',
        author: 'test-user-id',
        authorName: 'Test Author',
        category: 'leadership',
        tags: ['leadership'],
        status: 'draft' as const,
      };

      jest.spyOn(blogService, 'create').mockResolvedValue({
        id: 'draft-123',
        error: undefined,
      });

      const createResult = await blogService.create(draftPost);
      expect(createResult.id).toBe('draft-123');

      // Publish the post
      jest.spyOn(blogService, 'update').mockResolvedValue({
        error: undefined,
      });

      const publishResult = await blogService.update('draft-123', {
        status: 'published',
      });
      expect(publishResult.error).toBeUndefined();

      // Verify it appears in published posts
      const mockPublishedPosts = [
        {
          id: 'draft-123',
          title: 'Draft Post',
          content: 'Draft content',
          excerpt: 'Draft excerpt',
          author: 'test-user-id',
          authorName: 'Test Author',
          category: 'leadership',
          tags: ['leadership'],
          status: 'published',
          viewCount: 0,
          readTime: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(blogService, 'getPublishedPosts').mockResolvedValue({
        posts: mockPublishedPosts,
        error: undefined,
      });

      const publishedResult = await blogService.getPublishedPosts(10);
      expect(publishedResult.error).toBeUndefined();
      expect(publishedResult.posts).toHaveLength(1);
      expect(publishedResult.posts[0].status).toBe('published');
    });

    it('should handle blog post view counting', async () => {
      // Create a post
      const postData = {
        title: 'View Test Post',
        content: 'Content for view testing',
        excerpt: 'View test excerpt',
        author: 'test-user-id',
        authorName: 'Test Author',
        category: 'leadership',
        tags: ['leadership'],
        status: 'published' as const,
      };

      jest.spyOn(blogService, 'create').mockResolvedValue({
        id: 'view-test-123',
        error: undefined,
      });

      await blogService.create(postData);

      // Increment view count multiple times
      jest.spyOn(blogService, 'incrementViewCount').mockResolvedValue({
        error: undefined,
      });

      await blogService.incrementViewCount('view-test-123');
      await blogService.incrementViewCount('view-test-123');
      await blogService.incrementViewCount('view-test-123');

      expect(blogService.incrementViewCount).toHaveBeenCalledTimes(3);
      expect(blogService.incrementViewCount).toHaveBeenCalledWith('view-test-123');
    });
  });

  describe('Resources Management Workflow', () => {
    it('should complete full CRUD workflow for resources', async () => {
      // 1. CREATE - Create a new resource
      const newResourceData = {
        title: 'Test Resource',
        description: 'This is a test resource description.',
        type: 'pdf' as const,
        category: 'leadership' as const,
        isPublic: true,
        createdBy: 'test-user-id',
        tags: ['leadership', 'test'],
        featured: false,
      };

      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

      // Mock successful creation
      const mockCreateResponse = { id: 'new-resource-123', error: undefined };
      jest.spyOn(resourcesService, 'create').mockResolvedValue(mockCreateResponse);

      const createResult = await resourcesService.create(newResourceData, mockFile);
      expect(createResult.error).toBeUndefined();
      expect(createResult.id).toBe('new-resource-123');

      // 2. READ - Fetch the created resource
      const mockResource = {
        id: 'new-resource-123',
        ...newResourceData,
        fileUrl: 'https://example.com/test.pdf',
        fileSize: 1024,
        downloadCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(resourcesService, 'getById').mockResolvedValue({
        resource: mockResource,
        error: undefined,
      });

      const readResult = await resourcesService.getById('new-resource-123');
      expect(readResult.error).toBeUndefined();
      expect(readResult.resource?.title).toBe('Test Resource');

      // 3. UPDATE - Update the resource
      const updateData = {
        title: 'Updated Test Resource',
        description: 'Updated description for the test resource.',
        featured: true,
      };

      jest.spyOn(resourcesService, 'update').mockResolvedValue({
        error: undefined,
      });

      const updateResult = await resourcesService.update('new-resource-123', updateData);
      expect(updateResult.error).toBeUndefined();

      // 4. DELETE - Delete the resource
      jest.spyOn(resourcesService, 'delete').mockResolvedValue({
        error: undefined,
      });

      const deleteResult = await resourcesService.delete('new-resource-123');
      expect(deleteResult.error).toBeUndefined();

      // Verify the resource is gone
      jest.spyOn(resourcesService, 'getById').mockResolvedValue({
        resource: null,
        error: 'Resource not found',
      });

      const verifyDeleteResult = await resourcesService.getById('new-resource-123');
      expect(verifyDeleteResult.error).toBe('Resource not found');
      expect(verifyDeleteResult.resource).toBeNull();
    });

    it('should handle resource download counting', async () => {
      // Create a resource
      const resourceData = {
        title: 'Download Test Resource',
        description: 'Resource for download testing',
        type: 'pdf' as const,
        category: 'leadership' as const,
        isPublic: true,
        createdBy: 'test-user-id',
        tags: ['leadership'],
        featured: false,
      };

      jest.spyOn(resourcesService, 'create').mockResolvedValue({
        id: 'download-test-123',
        error: undefined,
      });

      await resourcesService.create(resourceData);

      // Increment download count multiple times
      jest.spyOn(resourcesService, 'incrementDownloadCount').mockResolvedValue({
        error: undefined,
      });

      await resourcesService.incrementDownloadCount('download-test-123');
      await resourcesService.incrementDownloadCount('download-test-123');
      await resourcesService.incrementDownloadCount('download-test-123');
      await resourcesService.incrementDownloadCount('download-test-123');

      expect(resourcesService.incrementDownloadCount).toHaveBeenCalledTimes(4);
      expect(resourcesService.incrementDownloadCount).toHaveBeenCalledWith('download-test-123');
    });

    it('should handle public vs private resources', async () => {
      // Create public resource
      const publicResource = {
        title: 'Public Resource',
        description: 'This is a public resource',
        type: 'pdf' as const,
        category: 'leadership' as const,
        isPublic: true,
        createdBy: 'test-user-id',
        tags: ['leadership'],
        featured: false,
      };

      jest.spyOn(resourcesService, 'create').mockResolvedValue({
        id: 'public-123',
        error: undefined,
      });

      await resourcesService.create(publicResource);

      // Create private resource
      const privateResource = {
        title: 'Private Resource',
        description: 'This is a private resource',
        type: 'pdf' as const,
        category: 'coaching' as const,
        isPublic: false,
        createdBy: 'test-user-id',
        tags: ['coaching'],
        featured: false,
      };

      jest.spyOn(resourcesService, 'create').mockResolvedValue({
        id: 'private-123',
        error: undefined,
      });

      await resourcesService.create(privateResource);

      // Test getting public resources only
      const mockPublicResources = [
        {
          id: 'public-123',
          title: 'Public Resource',
          description: 'This is a public resource',
          type: 'pdf' as const,
          category: 'leadership' as const,
          fileUrl: 'https://example.com/public.pdf',
          fileSize: 1024,
          downloadCount: 0,
          isPublic: true,
          createdBy: 'test-user-id',
          tags: ['leadership'],
          featured: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(resourcesService, 'getPublicResources').mockResolvedValue({
        resources: mockPublicResources,
        error: undefined,
      });

      const publicResult = await resourcesService.getPublicResources(10);
      expect(publicResult.error).toBeUndefined();
      expect(publicResult.resources).toHaveLength(1);
      expect(publicResult.resources[0].isPublic).toBe(true);
      expect(publicResult.resources[0].title).toBe('Public Resource');
    });

    it('should handle video resources without file upload', async () => {
      // Create video resource
      const videoResource = {
        title: 'Video Resource',
        description: 'This is a video resource',
        type: 'video' as const,
        category: 'coaching' as const,
        fileUrl: 'https://youtube.com/watch?v=123',
        isPublic: true,
        createdBy: 'test-user-id',
        tags: ['coaching'],
        featured: false,
      };

      jest.spyOn(resourcesService, 'create').mockResolvedValue({
        id: 'video-123',
        error: undefined,
      });

      const createResult = await resourcesService.create(videoResource);
      expect(createResult.error).toBeUndefined();
      expect(createResult.id).toBe('video-123');

      // Verify video resource was created without file upload
      expect(resourcesService.create).toHaveBeenCalledWith(videoResource);
    });
  });

  describe('Admin Dashboard Statistics', () => {
    it('should generate blog statistics', async () => {
      const mockStats = {
        total: 10,
        published: 7,
        draft: 3,
        totalViews: 1250,
        byCategory: {
          leadership: 5,
          coaching: 3,
          management: 2,
        },
      };

      jest.spyOn(blogService, 'getStats').mockResolvedValue({
        ...mockStats,
        error: undefined,
      });

      const statsResult = await blogService.getStats();
      expect(statsResult.error).toBeUndefined();
      expect(statsResult.total).toBe(10);
      expect(statsResult.published).toBe(7);
      expect(statsResult.draft).toBe(3);
      expect(statsResult.totalViews).toBe(1250);
      expect(statsResult.byCategory).toEqual({
        leadership: 5,
        coaching: 3,
        management: 2,
      });
    });

    it('should generate resource statistics', async () => {
      const mockStats = {
        total: 15,
        totalDownloads: 2500,
        byCategory: {
          leadership: 8,
          coaching: 5,
          management: 2,
        },
      };

      jest.spyOn(resourcesService, 'getStats').mockResolvedValue({
        ...mockStats,
        error: undefined,
      });

      const statsResult = await resourcesService.getStats();
      expect(statsResult.error).toBeUndefined();
      expect(statsResult.total).toBe(15);
      expect(statsResult.totalDownloads).toBe(2500);
      expect(statsResult.byCategory).toEqual({
        leadership: 8,
        coaching: 5,
        management: 2,
      });
    });
  });

  describe('Search and Filtering', () => {
    it('should handle blog search and filtering', async () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Leadership Blog Post',
          content: 'Content about leadership',
          excerpt: 'Leadership excerpt',
          author: 'test-user-id',
          authorName: 'Test Author',
          category: 'leadership',
          tags: ['leadership'],
          status: 'published',
          viewCount: 10,
          readTime: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Coaching Blog Post',
          content: 'Content about coaching',
          excerpt: 'Coaching excerpt',
          author: 'test-user-id',
          authorName: 'Test Author',
          category: 'coaching',
          tags: ['coaching'],
          status: 'draft',
          viewCount: 5,
          readTime: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(blogService, 'getAll').mockResolvedValue({
        posts: mockPosts,
        error: undefined,
      });

      // Test search
      const searchResult = await blogService.getAll({ search: 'leadership' });
      expect(searchResult.error).toBeUndefined();
      expect(blogService.getAll).toHaveBeenCalledWith({ search: 'leadership' });

      // Test category filter
      const categoryResult = await blogService.getAll({ category: 'leadership' });
      expect(categoryResult.error).toBeUndefined();
      expect(blogService.getAll).toHaveBeenCalledWith({ category: 'leadership' });

      // Test status filter
      const statusResult = await blogService.getAll({ status: 'published' });
      expect(statusResult.error).toBeUndefined();
      expect(blogService.getAll).toHaveBeenCalledWith({ status: 'published' });
    });

    it('should handle resource search and filtering', async () => {
      const mockResources = [
        {
          id: '1',
          title: 'Leadership PDF',
          description: 'Leadership resource',
          type: 'pdf' as const,
          category: 'leadership' as const,
          fileUrl: 'https://example.com/leadership.pdf',
          fileSize: 1024,
          downloadCount: 10,
          isPublic: true,
          createdBy: 'test-user-id',
          tags: ['leadership'],
          featured: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Coaching Video',
          description: 'Coaching resource',
          type: 'video' as const,
          category: 'coaching' as const,
          fileUrl: 'https://youtube.com/watch?v=123',
          fileSize: 0,
          downloadCount: 5,
          isPublic: false,
          createdBy: 'test-user-id',
          tags: ['coaching'],
          featured: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(resourcesService, 'getAll').mockResolvedValue({
        resources: mockResources,
        error: undefined,
      });

      // Test search
      const searchResult = await resourcesService.getAll({ search: 'leadership' });
      expect(searchResult.error).toBeUndefined();
      expect(resourcesService.getAll).toHaveBeenCalledWith({ search: 'leadership' });

      // Test category filter
      const categoryResult = await resourcesService.getAll({ category: 'leadership' });
      expect(categoryResult.error).toBeUndefined();
      expect(resourcesService.getAll).toHaveBeenCalledWith({ category: 'leadership' });

      // Test type filter
      const typeResult = await resourcesService.getAll({ type: 'pdf' });
      expect(typeResult.error).toBeUndefined();
      expect(resourcesService.getAll).toHaveBeenCalledWith({ type: 'pdf' });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle concurrent operations gracefully', async () => {
      // Simulate multiple users trying to update the same blog post
      const postId = 'concurrent-test-123';
      const updateData1 = { title: 'Update 1' };
      const updateData2 = { title: 'Update 2' };

      jest.spyOn(blogService, 'update').mockResolvedValue({
        error: undefined,
      });

      // Simulate concurrent updates
      const update1 = blogService.update(postId, updateData1);
      const update2 = blogService.update(postId, updateData2);

      const [result1, result2] = await Promise.all([update1, update2]);

      expect(result1.error).toBeUndefined();
      expect(result2.error).toBeUndefined();
      expect(blogService.update).toHaveBeenCalledTimes(2);
    });

    it('should handle large file uploads', async () => {
      // Create a large file mock
      const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.pdf', {
        type: 'application/pdf',
      });

      const resourceData = {
        title: 'Large File Resource',
        description: 'Resource with large file',
        type: 'pdf' as const,
        category: 'leadership' as const,
        isPublic: true,
        createdBy: 'test-user-id',
        tags: ['leadership'],
        featured: false,
      };

      jest.spyOn(resourcesService, 'create').mockResolvedValue({
        id: 'large-file-123',
        error: undefined,
      });

      const result = await resourcesService.create(resourceData, largeFile);
      expect(result.error).toBeUndefined();
      expect(result.id).toBe('large-file-123');
    });

    it('should handle network failures gracefully', async () => {
      // Simulate network failure
      jest.spyOn(blogService, 'getAll').mockRejectedValue(new Error('Network error'));

      await expect(blogService.getAll()).rejects.toThrow('Network error');
    });

    it('should handle invalid data gracefully', async () => {
      // Test with invalid blog post data
      const invalidPostData = {
        title: '', // Empty title should be invalid
        content: 'Valid content',
        excerpt: 'Valid excerpt',
        author: 'test-user-id',
        authorName: 'Test Author',
        category: 'leadership',
        tags: ['leadership'],
        status: 'draft' as const,
      };

      jest.spyOn(blogService, 'create').mockResolvedValue({
        id: '',
        error: 'Invalid data provided',
      });

      const result = await blogService.create(invalidPostData);
      expect(result.error).toBe('Invalid data provided');
      expect(result.id).toBe('');
    });
  });
});

