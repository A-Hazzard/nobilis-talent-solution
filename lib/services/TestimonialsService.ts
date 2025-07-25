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
  limit as firestoreLimit, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Testimonial } from '@/shared/types/entities';

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
        q = query(q, firestoreLimit(pageLimit * 2)); // Get more to account for sorting
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
      // Prepare document data, filtering out undefined values
      const docData: any = {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Only add fields that have values
      if (testimonialData.clientName !== undefined) docData.clientName = testimonialData.clientName;
      if (testimonialData.company !== undefined) docData.company = testimonialData.company;
      if (testimonialData.content !== undefined) docData.content = testimonialData.content;
      if (testimonialData.rating !== undefined) docData.rating = testimonialData.rating;
      if (testimonialData.isPublic !== undefined) docData.isPublic = testimonialData.isPublic;

      const docRef = await addDoc(collection(db, this.collectionName), docData);
      
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
      // Prepare update data, filtering out undefined values
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
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      
      return {};
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      return { error: 'Failed to delete testimonial' };
    }
  }

  /**
   * Get public testimonials for display
   */
  async getPublicTestimonials(limit?: number): Promise<{ testimonials: Testimonial[]; error?: string }> {
    try {
      // Build query with only the isPublic filter first, then sort in memory
      let q = query(collection(db, this.collectionName), where('isPublic', '==', true));
      
      if (limit) {
        q = query(q, firestoreLimit(limit * 2)); // Get more than needed to account for sorting
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
      if (limit) {
        testimonials = testimonials.slice(0, limit);
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
  async getHomepageTestimonials(limit?: number): Promise<{ testimonials: Testimonial[]; error?: string }> {
    try {
      // Build query for homepage testimonials (only public ones)
      let q = query(collection(db, this.collectionName), where('isPublic', '==', true));
      
      if (limit) {
        q = query(q, firestoreLimit(limit * 2)); // Get more than needed to account for sorting
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
      if (limit) {
        testimonials = testimonials.slice(0, limit);
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