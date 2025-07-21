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
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { FirebaseDocument, FirebaseQueryOptions } from '@/shared/types/firebase';

export abstract class BaseDataService<T extends FirebaseDocument> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected getCollectionRef() {
    return collection(db, this.collectionName);
  }

  protected getDocRef(id: string) {
    return doc(db, this.collectionName, id);
  }

  async getAll(options: FirebaseQueryOptions = {}): Promise<{ data: T[]; error: any; count: number }> {
    try {
      const constraints: QueryConstraint[] = [];

      // Apply where clauses
      if (options.where) {
        options.where.forEach(condition => {
          constraints.push(where(condition.field, condition.operator, condition.value));
        });
      }

      // Apply ordering
      if (options.orderBy) {
        constraints.push(orderBy(options.orderBy.field, options.orderBy.direction));
      }

      // Apply limit
      if (options.limit) {
        constraints.push(limit(options.limit));
      }

      const q = query(this.getCollectionRef(), ...constraints);
      const querySnapshot = await getDocs(q);
      
      const data: T[] = [];
      querySnapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        } as T);
      });

      return { data, error: null, count: data.length };
    } catch (error) {
      console.error(`Error getting all ${this.collectionName}:`, error);
      return { data: [], error, count: 0 };
    }
  }

  async getById(id: string): Promise<{ data: T | null; error: any }> {
    try {
      const docRef = this.getDocRef(id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
        } as T;
        return { data, error: null };
      } else {
        return { data: null, error: 'Document not found' };
      }
    } catch (error) {
      console.error(`Error getting ${this.collectionName} by id:`, error);
      return { data: null, error };
    }
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: T | null; error: any }> {
    try {
      const docData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(this.getCollectionRef(), docData);
      const newDoc = await getDoc(docRef);

      if (newDoc.exists()) {
        const createdData = {
          id: newDoc.id,
          ...newDoc.data(),
          createdAt: newDoc.data().createdAt?.toDate() || new Date(),
          updatedAt: newDoc.data().updatedAt?.toDate() || new Date(),
        } as T;
        return { data: createdData, error: null };
      } else {
        return { data: null, error: 'Failed to create document' };
      }
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      return { data: null, error };
    }
  }

  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<{ data: T | null; error: any }> {
    try {
      const docRef = this.getDocRef(id);
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await updateDoc(docRef, updateData);
      const updatedDoc = await getDoc(docRef);

      if (updatedDoc.exists()) {
        const updatedData = {
          id: updatedDoc.id,
          ...updatedDoc.data(),
          createdAt: updatedDoc.data().createdAt?.toDate() || new Date(),
          updatedAt: updatedDoc.data().updatedAt?.toDate() || new Date(),
        } as T;
        return { data: updatedData, error: null };
      } else {
        return { data: null, error: 'Document not found' };
      }
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      return { data: null, error };
    }
  }

  async delete(id: string): Promise<{ error: any }> {
    try {
      const docRef = this.getDocRef(id);
      await deleteDoc(docRef);
      return { error: null };
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error);
      return { error };
    }
  }
} 