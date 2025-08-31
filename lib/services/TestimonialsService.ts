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
import { db } from '@/lib/firebase/config';
import type { Testimonial } from '@/shared/types/entities';
import { logAdminAction } from '@/lib/helpers/auditLogger';

export class TestimonialsService {
  private static instance: TestimonialsService;
  private collectionName = 'testimonials';

  private constructor() {}

  /**
   * Get singleton instance of TestimonialsService
   */
  static getInstance(): TestimonialsService {
    if (!TestimonialsService.instance) {
      TestimonialsService.instance = new TestimonialsService();
    }
    return TestimonialsService.instance;
  }

  /**
   * Get all testimonials with filtering
   */
  async getAll(options: {
    isPublic?: boolean;
    limit?: number;
    search?: string;
  } = {}): Promise<{ testimonials: Testimonial[]; error?: string }> {
    try {
      const { isPublic, limit: pageLimit, search } = options;
      
      // Build query - avoid composite index by not combining filter and orderBy
      let q = query(collection(db, this.collectionName));
      
      if (isPublic !== undefined) {
        q = query(q, where('isPublic', '==', isPublic));
      }
      
      // Don't add orderBy here to avoid composite index requirement
      // We'll sort in memory instead
      
      if (pageLimit) {
        q = query(q, limit(pageLimit * 2)); // Get more to account for sorting
      }
      const snapshot = await getDocs(q);
      
      let testimonials: Testimonial[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Testimonial[];
      
      // Sort by creation date (newest first) in memory
      testimonials.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        testimonials = testimonials.filter(testimonial => 
          testimonial.clientName.toLowerCase().includes(searchLower) ||
          testimonial.company.toLowerCase().includes(searchLower) ||
          testimonial.content.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply limit after sorting and filtering
      if (pageLimit) {
        testimonials = testimonials.slice(0, pageLimit);
      }
      
      return { testimonials };
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return { testimonials: [], error: 'Failed to fetch testimonials' };
    }
  }

  /**
   * Get a single testimonial by ID
   */
  async getById(id: string): Promise<{ testimonial: Testimonial | null; error?: string }> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { testimonial: null, error: 'Testimonial not found' };
      }
      
      const testimonial = {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as Testimonial;
      
      return { testimonial };
    } catch (error) {
      console.error('Error fetching testimonial:', error);
      return { testimonial: null, error: 'Failed to fetch testimonial' };
    }
  }

  /**
   * Create a new testimonial
   */
  async create(testimonialData: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id: string; error?: string }> {
    try {
      // Validate required fields
      if (!testimonialData.clientName || !testimonialData.company || !testimonialData.content) {
        return { id: '', error: 'Client name, company, and content are required' };
      }

      if (testimonialData.rating < 1 || testimonialData.rating > 5) {
        return { id: '', error: 'Rating must be between 1 and 5' };
      }

      const docData = {
        clientName: testimonialData.clientName,
        company: testimonialData.company,
        content: testimonialData.content,
        rating: testimonialData.rating,
        isPublic: testimonialData.isPublic,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, this.collectionName), docData);
      
      // Audit log
      await logAdminAction({
        userId: 'wG2jJtLiFCOaRF6jZ2DMo8u8yAh1',
        action: 'create',
        entity: 'testimonial',
        entityId: docRef.id,
        details: { clientName: testimonialData.clientName, company: testimonialData.company },

      });
      
      return { id: docRef.id };
    } catch (error) {
      console.error('Error creating testimonial:', error);
      return { id: '', error: 'Failed to create testimonial' };
    }
  }

  /**
   * Update an existing testimonial
   */
  async update(id: string, updates: Partial<Omit<Testimonial, 'id' | 'createdAt'>>): Promise<{ error?: string }> {
    try {
      // Get current testimonial for audit logging
      const currentTestimonial = await this.getById(id);
      if (!currentTestimonial.testimonial) {
        return { error: 'Testimonial not found' };
      }

      // Validate rating if provided
      if (updates.rating !== undefined && (updates.rating < 1 || updates.rating > 5)) {
        return { error: 'Rating must be between 1 and 5' };
      }

      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      // Only add fields that have values
      if (updates.clientName !== undefined) updateData.clientName = updates.clientName;
      if (updates.company !== undefined) updateData.company = updates.company;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.rating !== undefined) updateData.rating = updates.rating;
      if (updates.isPublic !== undefined) updateData.isPublic = updates.isPublic;

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, updateData);
      
      // Audit log
      await logAdminAction({
        userId: 'wG2jJtLiFCOaRF6jZ2DMo8u8yAh1',
        action: 'update',
        entity: 'testimonial',
        entityId: id,
        details: { updates },

      });
      
      return {};
    } catch (error) {
      console.error('Error updating testimonial:', error);
      return { error: 'Failed to update testimonial' };
    }
  }

  /**
   * Delete a testimonial
   */
  async delete(id: string): Promise<{ error?: string }> {
    try {
      // Get testimonial info before deletion for audit logging
      const currentTestimonial = await this.getById(id);
      if (!currentTestimonial.testimonial) {
        return { error: 'Testimonial not found' };
      }

      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      
      // Audit log
      await logAdminAction({
        userId: 'wG2jJtLiFCOaRF6jZ2DMo8u8yAh1',
        action: 'delete',
        entity: 'testimonial',
        entityId: id,

      });
      
      return {};
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      return { error: 'Failed to delete testimonial' };
    }
  }

  /**
   * Get public testimonials for display
   */
  async getPublicTestimonials(pageLimit?: number): Promise<{ testimonials: Testimonial[]; error?: string }> {
    try {
      let q = query(collection(db, this.collectionName), where('isPublic', '==', true));
      
      if (pageLimit) {
        q = query(q, limit(pageLimit * 2)); // Get more than needed to account for sorting
      }
      const snapshot = await getDocs(q);
      
      let testimonials: Testimonial[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Testimonial[];
      
      // Sort by creation date (newest first) in memory
      testimonials.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Apply limit after sorting
      if (pageLimit) {
        testimonials = testimonials.slice(0, pageLimit);
      }
      
      return { testimonials };
    } catch (error) {
      console.error('Error fetching public testimonials:', error);
      return { testimonials: [], error: 'Failed to fetch public testimonials' };
    }
  }

  /**
   * Get testimonials to show on homepage
   */
  async getHomepageTestimonials(pageLimit?: number): Promise<{ testimonials: Testimonial[]; error?: string }> {
    try {
      let q = query(collection(db, this.collectionName), where('isPublic', '==', true));
      
      if (pageLimit) {
        q = query(q, limit(pageLimit * 2)); // Get more than needed to account for sorting
      }
      const snapshot = await getDocs(q);
      
      let testimonials: Testimonial[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Testimonial[];
      
      // Sort by creation date (newest first) in memory
      testimonials.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Apply limit after sorting
      if (pageLimit) {
        testimonials = testimonials.slice(0, pageLimit);
      }
      
      return { testimonials };
    } catch (error) {
      console.error('Error fetching homepage testimonials:', error);
      return { testimonials: [], error: 'Failed to fetch homepage testimonials' };
    }
  }

  /**
   * Get testimonial statistics
   */
  async getStats(): Promise<{ total: number; averageRating: number; error?: string }> {
    try {
      const snapshot = await getDocs(collection(db, this.collectionName));
      
      let total = 0;
      let totalRating = 0;
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        total++;
        totalRating += data.rating || 0;
      });
      
      const averageRating = total > 0 ? totalRating / total : 0;
      
      return { total, averageRating };
    } catch (error) {
      console.error('Error fetching testimonial stats:', error);
      return { total: 0, averageRating: 0, error: 'Failed to fetch testimonial statistics' };
    }
  }
} 