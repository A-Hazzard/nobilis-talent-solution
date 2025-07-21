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

/**
 * Service class for managing calendar events with Firebase integration
 * Implements singleton pattern for consistent state management
 */
export class CalendarService {
  private static instance: CalendarService;
  private events: CalendarEvent[] = [];
  private readonly collectionName = 'calendar-events';

  private constructor() {}

  /**
   * Get singleton instance of CalendarService
   * @returns CalendarService instance
   */
  static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  /**
   * Create a new calendar event in Firebase
   * @param eventData - Event data to create
   * @returns Promise with created event or error
   */
  async createEvent(eventData: CreateEventData): Promise<CalendarServiceResponse<CalendarEvent>> {
    try {
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

      const docRef = await addDoc(collection(db, this.collectionName), newEvent);
      
      const createdEvent: CalendarEvent = {
        id: docRef.id,
        ...newEvent,
      };

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
   * Update an existing calendar event in Firebase
   * @param eventData - Event data with ID to update
   * @returns Promise with updated event or error
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

      const eventRef = doc(db, this.collectionName, id);
      await updateDoc(eventRef, {
        ...updateData,
        updatedAt: new Date(),
      });

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
   * Delete a calendar event from Firebase
   * @param eventId - ID of event to delete
   * @returns Promise with success or error
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

      const eventRef = doc(db, this.collectionName, eventId);
      await deleteDoc(eventRef);
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
   * Get all calendar events from Firebase
   * @returns Promise with all events or error
   */
  async getEvents(): Promise<CalendarServiceResponse<CalendarEvent[]>> {
    try {
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
   * Get events for a specific date
   * @param date - Date string in YYYY-MM-DD format
   * @returns Promise with events for the date or error
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
   * Get upcoming events sorted by date
   * @param limit - Maximum number of events to return
   * @returns Promise with upcoming events or error
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
   * @param type - Event type to filter by
   * @returns Promise with filtered events or error
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
   * Validate event data before creation or update
   * @param data - Event data to validate
   * @returns Validation result with success status and error message
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
   * @param dateString - Date string to validate
   * @returns True if date is valid
   */
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
} 