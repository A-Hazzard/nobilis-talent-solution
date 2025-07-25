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
  startAfter,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Lead } from '@/shared/types/entities';
import { AuthService } from '@/lib/services/AuthService';
import { validateSignupForm } from '@/lib/utils/validation';
import { logAdminAction } from '@/lib/helpers/auditLogger';

export class LeadsService {
  private collectionName = 'users';
  private authService = AuthService.getInstance();

  /**
   * Get all leads (users) with pagination and filtering
   */
  async getAll(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<{ leads: Lead[]; total: number; error?: string }> {
    try {
      const { page = 1, limit: pageLimit = 10, search } = options;
      
      // Build query for users collection
      const constraints = [];
      
      // Only get users (not admins) - assuming role field exists
      constraints.push(where('role', '==', 'user'));
      constraints.push(orderBy('createdAt', 'desc'));
      
      // Get total count first
      const totalQuery = query(collection(db, this.collectionName), ...constraints);
      const totalSnapshot = await getDocs(totalQuery);
      const total = totalSnapshot.size;
      
      // Apply pagination
      if (page > 1) {
        const lastDoc = totalSnapshot.docs[(page - 1) * pageLimit - 1];
        if (lastDoc) {
          constraints.push(startAfter(lastDoc));
        }
      }
      
      constraints.push(limit(pageLimit));
      
      const finalQuery = query(collection(db, this.collectionName), ...constraints);
      const snapshot = await getDocs(finalQuery);
      
      let leads: Lead[] = snapshot.docs.map(doc => ({
        id: doc.id,
        firstName: doc.data().firstName || '',
        lastName: doc.data().lastName || '',
        email: doc.data().email || '',
        phone: doc.data().phone || '',
        organization: doc.data().organization || '',
        uid: doc.data().uid || '',
        displayName: doc.data().displayName || '',
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Lead[];
      
      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        leads = leads.filter(lead => 
          lead.firstName.toLowerCase().includes(searchLower) ||
          lead.lastName.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower) ||
          lead.organization?.toLowerCase().includes(searchLower) ||
          lead.phone?.includes(search)
        );
      }
      
      return { leads, total };
    } catch (error) {
      console.error('Error fetching leads:', error);
      return { leads: [], total: 0, error: 'Failed to fetch leads' };
    }
  }

  /**
   * Get a single lead by ID
   */
  async getById(id: string): Promise<{ lead: Lead | null; error?: string }> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { lead: null, error: 'Lead not found' };
      }
      
      const lead = {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as Lead;
      
      return { lead };
    } catch (error) {
      console.error('Error fetching lead:', error);
      return { lead: null, error: 'Failed to fetch lead' };
    }
  }

  /**
   * Create a new lead (user) with authentication
   */
  async create(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> & { password: string; confirmPassword: string }): Promise<{ id: string; error?: string }> {
    try {
      // Validate the lead data (including password validation)
      if (!leadData.password || !leadData.confirmPassword) {
        return { id: '', error: 'Password and confirmation are required' };
      }

      const validation = validateSignupForm({
        email: leadData.email,
        password: leadData.password,
        confirmPassword: leadData.confirmPassword,
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        organization: leadData.organization || ''
      });

      if (!validation.isValid) {
        const firstError = Object.values(validation.errors).find(error => error);
        return { id: '', error: firstError || 'Invalid input data' };
      }

      // Create user with authentication
      const { user, error: authError } = await this.authService.signUpWithEmail(
        leadData.email,
        leadData.password,
        leadData.firstName,
        leadData.lastName,
        leadData.organization || 'Not specified',
        leadData.phone || ''
      );

      if (authError) {
        return { id: '', error: authError.message };
      }

      if (!user) {
        return { id: '', error: 'Failed to create user account' };
      }

      // Create user document in Firestore (users collection)
      const userDocData = {
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        email: leadData.email,
        phone: leadData.phone,
        organization: leadData.organization,
        role: 'user', // All leads are regular users
        uid: user.uid,
        displayName: `${leadData.firstName} ${leadData.lastName}`,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, this.collectionName), userDocData);
      
      // Audit log
      await logAdminAction({
        userId: user.uid,
        userEmail: leadData.email,
        action: 'create',
        entity: 'lead',
        entityId: docRef.id,
        details: { firstName: leadData.firstName, lastName: leadData.lastName },
        timestamp: Date.now(),
      });
      
      return { id: docRef.id };
    } catch (error) {
      console.error('Error creating lead:', error);
      return { id: '', error: 'Failed to create lead' };
    }
  }

  /**
   * Update an existing lead (user)
   */
  async update(id: string, updates: Partial<Omit<Lead, 'id' | 'createdAt'>>): Promise<{ error?: string }> {
    try {
      // Prepare update data, filtering out undefined values
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      // Only add fields that have values
      if (updates.firstName !== undefined) updateData.firstName = updates.firstName;
      if (updates.lastName !== undefined) updateData.lastName = updates.lastName;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.organization !== undefined) updateData.organization = updates.organization;

      // Update displayName if firstName or lastName changed
      if (updates.firstName !== undefined || updates.lastName !== undefined) {
        const currentLead = await this.getById(id);
        if (currentLead.lead) {
          const newFirstName = updates.firstName || currentLead.lead.firstName;
          const newLastName = updates.lastName || currentLead.lead.lastName;
          updateData.displayName = `${newFirstName} ${newLastName}`;
        }
      }

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, updateData);
      
      // Audit log
      await logAdminAction({
        userId: 'wG2jJtLiFCOaRF6jZ2DMo8u8yAh1',
        action: 'update',
        entity: 'lead',
        entityId: id,
        details: { updates },
        timestamp: Date.now(),
      });
      
      return {};
    } catch (error) {
      console.error('Error updating lead:', error);
      return { error: 'Failed to update lead' };
    }
  }

  /**
   * Delete a lead
   */
  async delete(id: string): Promise<{ error?: string }> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      
      // Audit log
      await logAdminAction({
        userId: 'wG2jJtLiFCOaRF6jZ2DMo8u8yAh1',
        action: 'delete',
        entity: 'lead',
        entityId: id,
        timestamp: Date.now(),
      });
      
      return {};
    } catch (error) {
      console.error('Error deleting lead:', error);
      return { error: 'Failed to delete lead' };
    }
  }

  /**
   * Get lead (user) statistics
   */
  async getStats(): Promise<{ total: number; error?: string }> {
    try {
      const q = query(collection(db, this.collectionName), where('role', '==', 'user'));
      const snapshot = await getDocs(q);
      
      const total = snapshot.size;
      
      return { total };
    } catch (error) {
      console.error('Error fetching lead stats:', error);
      return { total: 0, error: 'Failed to fetch lead statistics' };
    }
  }
} 