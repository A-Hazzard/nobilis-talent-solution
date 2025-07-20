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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Testimonial } from '@/shared/types/entities';

export class TestimonialsService {
  private collectionName = 'testimonials';

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
      
      // Build query
      const constraints = [];
      
      if (isPublic !== undefined) {
        constraints.push(where('isPublic', '==', isPublic));
      }
      
      constraints.push(orderBy('createdAt', 'desc'));
      
      if (pageLimit) {
        constraints.push(limit(pageLimit));
      }
      
      const q = query(collection(db, this.collectionName), ...constraints);
      const snapshot = await getDocs(q);
      
      let testimonials: Testimonial[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Testimonial[];
      
      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        testimonials = testimonials.filter(testimonial => 
          testimonial.clientName.toLowerCase().includes(searchLower) ||
          testimonial.company.toLowerCase().includes(searchLower) ||
          testimonial.content.toLowerCase().includes(searchLower)
        );
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
    return this.getAll({ isPublic: true, limit });
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