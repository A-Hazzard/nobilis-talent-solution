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
  orderBy, 
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
import type { Resource } from '@/shared/types/entities';

export class ResourcesService {
  private collectionName = 'resources';

  // File type validation
  private readonly acceptedFileTypes = {
    pdf: ['.pdf'],
    docx: ['.docx', '.doc'],
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    video: ['.mp4', '.mov', '.avi', '.webm', '.mkv'],
    audio: ['.mp3', '.wav', '.ogg', '.m4a', '.aac']
  };

  private readonly maxFileSizes = {
    pdf: 10 * 1024 * 1024, // 10MB
    docx: 10 * 1024 * 1024, // 10MB
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
        return `resources/documents/${fileName}`;
      case 'docx':
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
      
      // Build query
      const constraints = [];
      
      if (category) {
        constraints.push(where('category', '==', category));
      }
      
      if (type) {
        constraints.push(where('type', '==', type));
      }
      
      if (isPublic !== undefined) {
        constraints.push(where('isPublic', '==', isPublic));
      }
      
      constraints.push(orderBy('createdAt', 'desc'));
      
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
      
      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        resources = resources.filter(resource => 
          resource.title.toLowerCase().includes(searchLower) ||
          resource.description.toLowerCase().includes(searchLower)
        );
      }
      
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
      let fileUrl = resourceData.fileUrl;
      let thumbnailUrl = resourceData.thumbnailUrl;
      let fileSize = resourceData.fileSize;

      // Handle file upload if provided
      if (file) {
        // Validate file
        const validation = this.validateFile(file, resourceData.type);
        if (!validation.valid) {
          return { id: '', error: validation.error };
        }

        const filePath = this.getStoragePath(file, resourceData.type);
        
        const uploadResult = await this.uploadFile(file, filePath);
        if (uploadResult.error) {
          return { id: '', error: uploadResult.error };
        }
        
        fileUrl = uploadResult.url;
        fileSize = file.size;
      }

      // Handle YouTube links for video type
      if (resourceData.type === 'video' && resourceData.fileUrl?.includes('youtube.com')) {
        fileUrl = resourceData.fileUrl;
        // Extract YouTube video ID for thumbnail
        const videoId = this.extractYouTubeVideoId(resourceData.fileUrl);
        if (videoId) {
          thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }

      // Prepare document data, filtering out undefined values
      const docData: any = {
        title: resourceData.title,
        description: resourceData.description,
        type: resourceData.type,
        category: resourceData.category,
        isPublic: resourceData.isPublic,
        createdBy: resourceData.createdBy,
        downloadCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Only add fields that have values
      if (fileUrl) docData.fileUrl = fileUrl;
      if (thumbnailUrl) docData.thumbnailUrl = thumbnailUrl;
      if (fileSize) docData.fileSize = fileSize;

      const docRef = await addDoc(collection(db, this.collectionName), docData);
      
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
      let fileUrl = updates.fileUrl;
      let thumbnailUrl = updates.thumbnailUrl;
      let fileSize = updates.fileSize;

      // Handle file upload if provided
      if (file) {
        // Validate file
        const validation = this.validateFile(file, updates.type || 'pdf');
        if (!validation.valid) {
          return { error: validation.error };
        }

        const filePath = this.getStoragePath(file, updates.type || 'pdf');
        
        const uploadResult = await this.uploadFile(file, filePath);
        if (uploadResult.error) {
          return { error: uploadResult.error };
        }
        
        fileUrl = uploadResult.url;
        fileSize = file.size;
      }

      // Handle YouTube links
      if (updates.type === 'video' && updates.fileUrl?.includes('youtube.com')) {
        fileUrl = updates.fileUrl;
        const videoId = this.extractYouTubeVideoId(updates.fileUrl);
        if (videoId) {
          thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }

      // Prepare update data, filtering out undefined values
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      // Only add fields that have values
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.isPublic !== undefined) updateData.isPublic = updates.isPublic;
      if (updates.createdBy !== undefined) updateData.createdBy = updates.createdBy;
      if (fileUrl) updateData.fileUrl = fileUrl;
      if (thumbnailUrl) updateData.thumbnailUrl = thumbnailUrl;
      if (fileSize) updateData.fileSize = fileSize;

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, updateData);
      
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
      // Get the resource first to delete the file
      const { resource } = await this.getById(id);
      if (resource) {
        // Delete file from storage if it's not a YouTube link
        if (resource.fileUrl && !resource.fileUrl.includes('youtube.com')) {
          try {
            const fileRef = ref(storage, resource.fileUrl);
            await deleteObject(fileRef);
          } catch (fileError) {
            console.warn('Could not delete file from storage:', fileError);
          }
        }
      }

      // Delete the document
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      
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