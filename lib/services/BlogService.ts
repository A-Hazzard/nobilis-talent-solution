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
  increment
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject
} from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import type { BlogPost } from '@/shared/types/entities';
import { logAdminAction } from '@/lib/helpers/auditLogger';

export class BlogService {
  private collectionName = 'blogPosts';

  /**
   * Create URL-friendly slug from title
   */
  private createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Calculate estimated reading time
   */
  private calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Upload featured image to Firebase Storage
   */
  async uploadFeaturedImage(file: File): Promise<{ url: string; error?: string }> {
    try {
      const timestamp = Date.now();
      const fileName = `blog-images/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return { url: downloadURL };
    } catch (error) {
      console.error('Error uploading featured image:', error);
      return { url: '', error: 'Failed to upload image' };
    }
  }

  /**
   * Get all blog posts with filtering
   */
  async getAll(options: {
    status?: BlogPost['status'];
    category?: string;
    tag?: string;
    limit?: number;
    search?: string;
  } = {}): Promise<{ posts: BlogPost[]; error?: string }> {
    try {
      const { status, category, tag, limit: pageLimit, search } = options;
      
      // Build query - avoid composite indexes by using minimal constraints
      const constraints = [];
      
      if (status) {
        constraints.push(where('status', '==', status));
      }
      
      // Don't use orderBy in Firestore query to avoid composite index issues
      // We'll sort in memory instead
      
      if (pageLimit) {
        constraints.push(limit(pageLimit));
      }
      
      const q = query(collection(db, this.collectionName), ...constraints);
      const snapshot = await getDocs(q);
      
      let posts: BlogPost[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        publishedAt: doc.data().publishedAt?.toDate(),
      })) as BlogPost[];
      
      // Apply additional filters in memory to avoid composite index issues
      if (category) {
        posts = posts.filter(post => post.category === category);
      }
      
      // Apply tag filter if provided
      if (tag) {
        posts = posts.filter(post => post.tags.includes(tag));
      }
      
      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        posts = posts.filter(post => 
          post.title.toLowerCase().includes(searchLower) ||
          post.excerpt.toLowerCase().includes(searchLower) ||
          post.content.toLowerCase().includes(searchLower) ||
          post.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      // Always sort by createdAt in memory
      posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return { posts };
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return { posts: [], error: 'Failed to fetch blog posts' };
    }
  }

  /**
   * Get a single blog post by ID
   */
  async getById(id: string): Promise<{ post: BlogPost | null; error?: string }> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { post: null, error: 'Blog post not found' };
      }
      
      const post = {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
        publishedAt: docSnap.data().publishedAt?.toDate(),
      } as BlogPost;
      
      return { post };
    } catch (error) {
      console.error('Error fetching blog post:', error);
      return { post: null, error: 'Failed to fetch blog post' };
    }
  }

  /**
   * Get a blog post by slug
   */
  async getBySlug(slug: string): Promise<{ post: BlogPost | null; error?: string }> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('slug', '==', slug),
        where('status', '==', 'published')
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return { post: null, error: 'Blog post not found' };
      }
      
      const doc = snapshot.docs[0];
      const post = {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        publishedAt: doc.data().publishedAt?.toDate(),
      } as BlogPost;
      
      return { post };
    } catch (error) {
      console.error('Error fetching blog post by slug:', error);
      return { post: null, error: 'Failed to fetch blog post' };
    }
  }

  /**
   * Create a new blog post
   */
  async create(postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'slug'>, featuredImage?: File): Promise<{ id: string; error?: string }> {
    try {
      let featuredImageUrl = postData.featuredImage;

      // Handle featured image upload if provided
      if (featuredImage) {
        const uploadResult = await this.uploadFeaturedImage(featuredImage);
        if (uploadResult.error) {
          return { id: '', error: uploadResult.error };
        }
        featuredImageUrl = uploadResult.url;
      }

      // Create slug from title
      const slug = this.createSlug(postData.title);
      
      // Calculate reading time
      const readTime = this.calculateReadTime(postData.content);

      // Prepare document data
      const docData: any = {
        title: postData.title,
        slug,
        content: postData.content,
        excerpt: postData.excerpt,
        author: postData.author,
        authorName: postData.authorName,
        category: postData.category,
        tags: postData.tags || [],
        status: postData.status,
        viewCount: 0,
        readTime,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Add optional fields
      if (featuredImageUrl) docData.featuredImage = featuredImageUrl;
      if (postData.seoTitle) docData.seoTitle = postData.seoTitle;
      if (postData.seoDescription) docData.seoDescription = postData.seoDescription;
      if (postData.resources) docData.resources = postData.resources;
      if (postData.references) docData.references = postData.references;
      
      // Set publishedAt if status is published
      if (postData.status === 'published') {
        docData.publishedAt = serverTimestamp();
      }

      const docRef = await addDoc(collection(db, this.collectionName), docData);
      
      // Log audit action
      await logAdminAction({
        userId: postData.author || 'wG2jJtLiFCOaRF6jZ2DMo8u8yAh1',
        action: 'create',
        entity: 'blog',
        entityId: docRef.id,
        details: { title: postData.title, category: postData.category },
        timestamp: Date.now(),
      });
      
      return { id: docRef.id };
    } catch (error) {
      console.error('Error creating blog post:', error);
      return { id: '', error: 'Failed to create blog post' };
    }
  }

  /**
   * Update an existing blog post
   */
  async update(id: string, updates: Partial<Omit<BlogPost, 'id' | 'createdAt' | 'viewCount'>>, featuredImage?: File): Promise<{ error?: string }> {
    try {
      // Get current blog post for audit logging
      const currentPost = await this.getById(id);
      if (!currentPost.post) {
        return { error: 'Blog post not found' };
      }

      let featuredImageUrl = updates.featuredImage;

      // Handle featured image upload if provided
      if (featuredImage) {
        const uploadResult = await this.uploadFeaturedImage(featuredImage);
        if (uploadResult.error) {
          return { error: uploadResult.error };
        }
        featuredImageUrl = uploadResult.url;
      }

      // Create new slug if title changed
      let slug = updates.slug;
      if (updates.title && updates.title !== currentPost.post.title) {
        slug = this.createSlug(updates.title);
      }

      // Calculate reading time if content changed
      let readTime = updates.readTime;
      if (updates.content) {
        readTime = this.calculateReadTime(updates.content);
      }

      // Prepare update data
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      // Add fields that have values
      if (updates.title !== undefined) updateData.title = updates.title;
      if (slug) updateData.slug = slug;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.excerpt !== undefined) updateData.excerpt = updates.excerpt;
      if (updates.author !== undefined) updateData.author = updates.author;
      if (updates.authorName !== undefined) updateData.authorName = updates.authorName;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.tags !== undefined) updateData.tags = updates.tags;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (readTime !== undefined) updateData.readTime = readTime;
      if (featuredImageUrl) updateData.featuredImage = featuredImageUrl;
      if (updates.seoTitle !== undefined) updateData.seoTitle = updates.seoTitle;
      if (updates.seoDescription !== undefined) updateData.seoDescription = updates.seoDescription;
      if (updates.resources !== undefined) updateData.resources = updates.resources;
      if (updates.references !== undefined) updateData.references = updates.references;

      // Set publishedAt if status is being changed to published
      if (updates.status === 'published') {
        updateData.publishedAt = serverTimestamp();
      }

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, updateData);
      
      // Log audit action
      await logAdminAction({
        userId: 'wG2jJtLiFCOaRF6jZ2DMo8u8yAh1',
        action: 'update',
        entity: 'blog',
        entityId: id,
        details: { updates },
        timestamp: Date.now(),
      });
      
      return {};
    } catch (error) {
      console.error('Error updating blog post:', error);
      return { error: 'Failed to update blog post' };
    }
  }

  /**
   * Delete a blog post and its featured image
   */
  async delete(id: string): Promise<{ error?: string }> {
    try {
      // Get the blog post first to delete the featured image and for audit logging
      const { post } = await this.getById(id);
      if (!post) {
        return { error: 'Blog post not found' };
      }

      if (post.featuredImage) {
        try {
          const imageRef = ref(storage, post.featuredImage);
          await deleteObject(imageRef);
        } catch (imageError) {
          console.warn('Could not delete featured image from storage:', imageError);
        }
      }

      // Delete the document
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      
      // Log audit action
      await logAdminAction({
        userId: 'wG2jJtLiFCOaRF6jZ2DMo8u8yAh1',
        action: 'delete',
        entity: 'blog',
        entityId: id,
        timestamp: Date.now(),
      });
      
      return {};
    } catch (error) {
      console.error('Error deleting blog post:', error);
      return { error: 'Failed to delete blog post' };
    }
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<{ error?: string }> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        viewCount: increment(1),
      });
      
      return {};
    } catch (error) {
      console.error('Error incrementing view count:', error);
      return { error: 'Failed to update view count' };
    }
  }

  /**
   * Get published blog posts for public display
   */
  async getPublishedPosts(limit?: number): Promise<{ posts: BlogPost[]; error?: string }> {
    return this.getAll({ status: 'published', limit });
  }

  /**
   * Get blog post statistics
   */
  async getStats(): Promise<{ total: number; published: number; draft: number; totalViews: number; byCategory: Record<string, number>; error?: string }> {
    try {
      const snapshot = await getDocs(collection(db, this.collectionName));
      
      let total = 0;
      let published = 0;
      let draft = 0;
      let totalViews = 0;
      const byCategory: Record<string, number> = {};
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        total++;
        totalViews += data.viewCount || 0;
        
        if (data.status === 'published') {
          published++;
        } else if (data.status === 'draft') {
          draft++;
        }
        
        const category = data.category || 'uncategorized';
        byCategory[category] = (byCategory[category] || 0) + 1;
      });
      
      return { total, published, draft, totalViews, byCategory };
    } catch (error) {
      console.error('Error fetching blog stats:', error);
      return { total: 0, published: 0, draft: 0, totalViews: 0, byCategory: {}, error: 'Failed to fetch blog statistics' };
    }
  }
} 