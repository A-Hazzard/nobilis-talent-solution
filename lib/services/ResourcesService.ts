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
import { db, storage } from '@/lib/firebase/config';
import type { Resource } from '@/shared/types/entities';
import { logAdminAction } from '@/lib/helpers/auditLogger';

export class ResourcesService {
  private collectionName = 'resources';

  // File type validation
  private readonly acceptedFileTypes = {
    pdf: ['.pdf'],
    docx: ['.docx', '.doc'],
    article: ['.pdf', '.docx', '.doc', '.txt', '.md'],
    whitepaper: ['.pdf', '.docx', '.doc'],
    template: ['.pdf', '.docx', '.doc', '.xlsx', '.xls'],
    toolkit: ['.pdf', '.docx', '.doc', '.zip', '.rar'],
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    video: ['.mp4', '.mov', '.avi', '.webm', '.mkv'],
    audio: ['.mp3', '.wav', '.ogg', '.m4a', '.aac']
  };

  private readonly maxFileSizes = {
    pdf: 10 * 1024 * 1024, // 10MB
    docx: 10 * 1024 * 1024, // 10MB
    article: 10 * 1024 * 1024, // 10MB
    whitepaper: 10 * 1024 * 1024, // 10MB
    template: 10 * 1024 * 1024, // 10MB
    toolkit: 50 * 1024 * 1024, // 50MB
    image: 5 * 1024 * 1024, // 5MB
    video: 100 * 1024 * 1024, // 100MB
    audio: 20 * 1024 * 1024 // 20MB
  };

  /**
   * Validate file type and size
   */
  private validateFile(file: File, expectedType: Resource['type']): { valid: boolean; error?: string } {
    // Check file size
    const maxSize = this.maxFileSizes[expectedType];
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${this.formatFileSize(maxSize)}`
      };
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const acceptedExtensions = this.acceptedFileTypes[expectedType];
    const hasValidExtension = acceptedExtensions.some(ext => fileName.endsWith(ext));

    if (!hasValidExtension) {
      return {
        valid: false,
        error: `File type not supported for ${expectedType}. Accepted extensions: ${acceptedExtensions.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get Firebase Storage path based on file type
   */
  private getStoragePath(file: File, type: Resource['type']): string {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;

    // Organize files by type in Firebase Storage
    switch (type) {
      case 'pdf':
      case 'docx':
      case 'article':
      case 'whitepaper':
      case 'template':
      case 'toolkit':
        return `resources/documents/${fileName}`;
      case 'image':
        return `resources/images/${fileName}`;
      case 'video':
        return `resources/videos/${fileName}`;
      case 'audio':
        return `resources/audio/${fileName}`;
      default:
        return `resources/other/${fileName}`;
    }
  }

  /**
   * Get all resources with filtering
   */
  async getAll(options: {
    category?: Resource['category'];
    type?: Resource['type'];
    isPublic?: boolean;
    limit?: number;
    search?: string;
  } = {}): Promise<{ resources: Resource[]; error?: string }> {
    try {
      const { category, type, isPublic, limit: pageLimit, search } = options;

      // Build query - avoid composite indexes by using minimal constraints
      const constraints = [];

      // Prioritize isPublic filter as it's most important for content page
      if (isPublic !== undefined) {
        constraints.push(where('isPublic', '==', isPublic));
      }

      // Don't use orderBy in Firestore query to avoid composite index issues
      // We'll sort in memory instead

      if (pageLimit) {
        constraints.push(limit(pageLimit));
      }

      const q = query(collection(db, this.collectionName), ...constraints);
      const snapshot = await getDocs(q);

      let resources: Resource[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Resource[];

      // Apply additional filters in memory to avoid composite index issues
      if (category) {
        resources = resources.filter(resource => resource.category === category);
      }

      if (type) {
        resources = resources.filter(resource => resource.type === type);
      }

      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        resources = resources.filter(resource =>
          resource.title.toLowerCase().includes(searchLower) ||
          resource.description.toLowerCase().includes(searchLower)
        );
      }

      // Always sort by createdAt in memory
      resources.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return { resources };
    } catch (error) {
      console.error('Error fetching resources:', error);
      return { resources: [], error: 'Failed to fetch resources' };
    }
  }

  /**
   * Get a single resource by ID
   */
  async getById(id: string): Promise<{ resource: Resource | null; error?: string }> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { resource: null, error: 'Resource not found' };
      }

      const resource = {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as Resource;

      return { resource };
    } catch (error) {
      console.error('Error fetching resource:', error);
      return { resource: null, error: 'Failed to fetch resource' };
    }
  }

  /**
   * Upload a file to Firebase Storage
   */
  async uploadFile(file: File, path: string): Promise<{ url: string; error?: string }> {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return { url: downloadURL };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { url: '', error: 'Failed to upload file' };
    }
  }

  /**
   * Create a new resource
   */
  async create(resourceData: Omit<Resource, 'id' | 'createdAt' | 'updatedAt' | 'downloadCount'>, file?: File): Promise<{ id: string; error?: string }> {
    try {
      // Validate required fields
      if (!resourceData.title || !resourceData.description) {
        return { id: '', error: 'Title and description are required' };
      }

      // Handle file upload if provided
      let fileUrl = resourceData.fileUrl;
      let fileSize = resourceData.fileSize;
      let thumbnailUrl = resourceData.thumbnailUrl;

      if (file) {
        // Validate file
        const validation = this.validateFile(file, resourceData.type);
        if (!validation.valid) {
          return { id: '', error: validation.error || 'Invalid file' };
        }

        // Upload file
        const storagePath = this.getStoragePath(file, resourceData.type);
        const uploadResult = await this.uploadFile(file, storagePath);
        if (uploadResult.error) {
          return { id: '', error: uploadResult.error };
        }

        fileUrl = uploadResult.url;
        fileSize = file.size;
      }

      // Create resource document
      const docData = {
        title: resourceData.title,
        description: resourceData.description,
        type: resourceData.type,
        category: resourceData.category,
        fileUrl,
        thumbnailUrl,
        fileSize,
        downloadCount: 0,
        isPublic: resourceData.isPublic,
        createdBy: resourceData.createdBy,
        tags: resourceData.tags || [],
        relatedResources: resourceData.relatedResources || [],
        featured: resourceData.featured || false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, this.collectionName), docData);

      // Log audit action
      await logAdminAction({
        userId: resourceData.createdBy || 'wG2jJtLiFCOaRF6jZ2DMo8u8yAh1',
        action: 'create',
        entity: 'resource',
        entityId: docRef.id,
        details: { title: resourceData.title, category: resourceData.category },
        timestamp: Date.now(),
      });

      return { id: docRef.id };
    } catch (error) {
      console.error('Error creating resource:', error);
      return { id: '', error: 'Failed to create resource' };
    }
  }

  /**
   * Update an existing resource
   */
  async update(id: string, updates: Partial<Omit<Resource, 'id' | 'createdAt'>>, file?: File): Promise<{ error?: string }> {
    try {
      // Get current resource for audit logging
      const currentResource = await this.getById(id);
      if (!currentResource.resource) {
        return { error: 'Resource not found' };
      }

      // Handle file upload if provided
      let fileUrl = updates.fileUrl;
      let fileSize = updates.fileSize;
      let thumbnailUrl = updates.thumbnailUrl;

      if (file) {
        // Validate file
        const validation = this.validateFile(file, updates.type || currentResource.resource.type);
        if (!validation.valid) {
          return { error: validation.error || 'Invalid file' };
        }

        // Upload new file
        const storagePath = this.getStoragePath(file, updates.type || currentResource.resource.type);
        const uploadResult = await this.uploadFile(file, storagePath);
        if (uploadResult.error) {
          return { error: uploadResult.error };
        }

        fileUrl = uploadResult.url;
        fileSize = file.size;

        // Delete old file if it exists
        if (currentResource.resource.fileUrl && currentResource.resource.fileUrl !== fileUrl) {
          try {
            const oldFileRef = ref(storage, currentResource.resource.fileUrl);
            await deleteObject(oldFileRef);
          } catch (deleteError) {
            console.warn('Could not delete old file:', deleteError);
          }
        }
      }

      // Prepare update data
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      // Only add fields that have values
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (fileUrl) updateData.fileUrl = fileUrl;
      if (thumbnailUrl) updateData.thumbnailUrl = thumbnailUrl;
      if (fileSize !== undefined) updateData.fileSize = fileSize;
      if (updates.isPublic !== undefined) updateData.isPublic = updates.isPublic;
      if (updates.tags !== undefined) updateData.tags = updates.tags;
      if (updates.featured !== undefined) updateData.featured = updates.featured;
      if (updates.relatedResources !== undefined) updateData.relatedResources = updates.relatedResources;

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, updateData);

      // Log audit action
      await logAdminAction({
        userId: 'wG2jJtLiFCOaRF6jZ2DMo8u8yAh1',
        action: 'update',
        entity: 'resource',
        entityId: id,
        details: { updates },
        timestamp: Date.now(),
      });

      return {};
    } catch (error) {
      console.error('Error updating resource:', error);
      return { error: 'Failed to update resource' };
    }
  }

  /**
   * Delete a resource and its associated file
   */
  async delete(id: string): Promise<{ error?: string }> {
    try {
      // Get resource info before deletion for audit logging
      const currentResource = await this.getById(id);
      if (!currentResource.resource) {
        return { error: 'Resource not found' };
      }

      // Delete file from storage if it exists
      if (currentResource.resource.fileUrl) {
        try {
          const fileRef = ref(storage, currentResource.resource.fileUrl);
          await deleteObject(fileRef);
        } catch (deleteError) {
          console.warn('Could not delete file from storage:', deleteError);
        }
      }

      // Delete thumbnail if it exists
      if (currentResource.resource.thumbnailUrl) {
        try {
          const thumbnailRef = ref(storage, currentResource.resource.thumbnailUrl);
          await deleteObject(thumbnailRef);
        } catch (deleteError) {
          console.warn('Could not delete thumbnail from storage:', deleteError);
        }
      }

      // Delete document
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);

      // Log audit action
      await logAdminAction({
        userId: 'wG2jJtLiFCOaRF6jZ2DMo8u8yAh1',
        action: 'delete',
        entity: 'resource',
        entityId: id,
        timestamp: Date.now(),
      });

      return {};
    } catch (error) {
      console.error('Error deleting resource:', error);
      return { error: 'Failed to delete resource' };
    }
  }

  /**
   * Increment download count
   */
  async incrementDownloadCount(id: string): Promise<{ error?: string }> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        downloadCount: increment(1),
      });

      return {};
    } catch (error) {
      console.error('Error incrementing download count:', error);
      return { error: 'Failed to update download count' };
    }
  }

  /**
   * Get public resources for display
   */
  async getPublicResources(limit?: number): Promise<{ resources: Resource[]; error?: string }> {
    return this.getAll({ isPublic: true, limit });
  }

  /**
   * Get resource statistics
   */
  async getStats(): Promise<{ total: number; totalDownloads: number; byCategory: Record<string, number>; error?: string }> {
    try {
      const snapshot = await getDocs(collection(db, this.collectionName));

      let total = 0;
      let totalDownloads = 0;
      const byCategory: Record<string, number> = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        total++;
        totalDownloads += data.downloadCount || 0;

        const category = data.category || 'other';
        byCategory[category] = (byCategory[category] || 0) + 1;
      });

      return { total, totalDownloads, byCategory };
    } catch (error) {
      console.error('Error fetching resource stats:', error);
      return { total: 0, totalDownloads: 0, byCategory: {}, error: 'Failed to fetch resource statistics' };
    }
  }

  /**
   * Extract YouTube video ID from URL
   */
  private extractYouTubeVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }
} 