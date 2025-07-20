import type { CalendarEvent } from '@/shared/types/entities';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, where } from 'firebase/firestore';

export interface CreateEventData {
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  type: CalendarEvent['type'];
  description?: string;
  createdBy: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

export interface CalendarServiceError {
  code: string;
  message: string;
}

export interface CalendarServiceResponse<T> {
  data?: T;
  error?: CalendarServiceError;
}

export class CalendarService {
  private static instance: CalendarService;
  private events: CalendarEvent[] = [];
  private collectionName = 'calendar-events';

  private constructor() {
    // No need to load events in constructor since we'll fetch from Firebase
  }

  static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  /**
   * Create a new calendar event
   */
  async createEvent(eventData: CreateEventData): Promise<CalendarServiceResponse<CalendarEvent>> {
    try {
      // Validate event data
      const validation = this.validateEventData(eventData);
      if (!validation.isValid) {
        return {
          error: {
            code: 'validation-error',
            message: validation.error || 'Invalid event data'
          }
        };
      }

      const newEvent: Omit<CalendarEvent, 'id'> = {
        ...eventData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to Firebase
      const docRef = await addDoc(collection(db, this.collectionName), newEvent);
      
      const createdEvent: CalendarEvent = {
        id: docRef.id,
        ...newEvent,
      };

      // Add to local cache
      this.events.push(createdEvent);

      return { data: createdEvent };
    } catch (error) {
      console.error('Error creating event:', error);
      return {
        error: {
          code: 'create-error',
          message: 'Failed to create event'
        }
      };
    }
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(eventData: UpdateEventData): Promise<CalendarServiceResponse<CalendarEvent>> {
    try {
      const { id, ...updateData } = eventData;
      const eventIndex = this.events.findIndex(event => event.id === id);

      if (eventIndex === -1) {
        return {
          error: {
            code: 'not-found',
            message: 'Event not found'
          }
        };
      }

      // Validate update data if provided
      if (Object.keys(updateData).length > 0) {
        const validation = this.validateEventData(updateData);
        if (!validation.isValid) {
          return {
            error: {
              code: 'validation-error',
              message: validation.error || 'Invalid event data'
            }
          };
        }
      }

      // Update in Firebase
      const eventRef = doc(db, this.collectionName, id);
      await updateDoc(eventRef, {
        ...updateData,
        updatedAt: new Date(),
      });

      // Update local cache
      this.events[eventIndex] = {
        ...this.events[eventIndex],
        ...updateData,
        updatedAt: new Date(),
      };

      return { data: this.events[eventIndex] };
    } catch (error) {
      console.error('Error updating event:', error);
      return {
        error: {
          code: 'update-error',
          message: 'Failed to update event'
        }
      };
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(eventId: string): Promise<CalendarServiceResponse<void>> {
    try {
      const eventIndex = this.events.findIndex(event => event.id === eventId);

      if (eventIndex === -1) {
        return {
          error: {
            code: 'not-found',
            message: 'Event not found'
          }
        };
      }

      // Delete from Firebase
      const eventRef = doc(db, this.collectionName, eventId);
      await deleteDoc(eventRef);

      // Remove from local cache
      this.events.splice(eventIndex, 1);

      return {};
    } catch (error) {
      console.error('Error deleting event:', error);
      return {
        error: {
          code: 'delete-error',
          message: 'Failed to delete event'
        }
      };
    }
  }

  /**
   * Get all calendar events
   */
  async getEvents(): Promise<CalendarServiceResponse<CalendarEvent[]>> {
    try {
      // Fetch from Firebase
      const eventsRef = collection(db, this.collectionName);
      const q = query(eventsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const firebaseEvents: CalendarEvent[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        firebaseEvents.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as CalendarEvent);
      });

      // Update local cache
      this.events = firebaseEvents;

      return { data: firebaseEvents };
    } catch (error) {
      console.error('Error getting events:', error);
      return {
        error: {
          code: 'fetch-error',
          message: 'Failed to fetch events'
        }
      };
    }
  }

  /**
   * Get events by date
   */
  async getEventsByDate(date: string): Promise<CalendarServiceResponse<CalendarEvent[]>> {
    try {
      const eventsRef = collection(db, this.collectionName);
      const q = query(eventsRef, where('date', '==', date));
      const querySnapshot = await getDocs(q);
      
      const events: CalendarEvent[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as CalendarEvent);
      });

      return { data: events };
    } catch (error) {
      console.error('Error getting events by date:', error);
      return {
        error: {
          code: 'fetch-error',
          message: 'Failed to fetch events by date'
        }
      };
    }
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(limit: number = 5): Promise<CalendarServiceResponse<CalendarEvent[]>> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const eventsRef = collection(db, this.collectionName);
      const q = query(
        eventsRef, 
        where('date', '>=', today),
        orderBy('date', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      const events: CalendarEvent[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as CalendarEvent);
      });

      return { data: events.slice(0, limit) };
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      return {
        error: {
          code: 'fetch-error',
          message: 'Failed to fetch upcoming events'
        }
      };
    }
  }

  /**
   * Get events by type
   */
  async getEventsByType(type: CalendarEvent['type']): Promise<CalendarServiceResponse<CalendarEvent[]>> {
    try {
      const eventsRef = collection(db, this.collectionName);
      const q = query(eventsRef, where('type', '==', type));
      const querySnapshot = await getDocs(q);
      
      const events: CalendarEvent[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as CalendarEvent);
      });

      return { data: events };
    } catch (error) {
      console.error('Error getting events by type:', error);
      return {
        error: {
          code: 'fetch-error',
          message: 'Failed to fetch events by type'
        }
      };
    }
  }

  /**
   * Validate event data
   */
  private validateEventData(data: Partial<CreateEventData>): { isValid: boolean; error?: string } {
    if (data.title && !data.title.trim()) {
      return { isValid: false, error: 'Title is required' };
    }

    if (data.date && !this.isValidDate(data.date)) {
      return { isValid: false, error: 'Invalid date format' };
    }

    if (data.time && !data.time.trim()) {
      return { isValid: false, error: 'Time is required' };
    }

    if (data.location && !data.location.trim()) {
      return { isValid: false, error: 'Location is required' };
    }

    if (data.attendees !== undefined && data.attendees < 1) {
      return { isValid: false, error: 'Attendees must be at least 1' };
    }

    if (data.type && !['workshop', 'consultation', 'training', 'meeting'].includes(data.type)) {
      return { isValid: false, error: 'Invalid event type' };
    }

    return { isValid: true };
  }

  /**
   * Check if date string is valid
   */
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
} 