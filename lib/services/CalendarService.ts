import type { CalendarEvent } from '@/shared/types/entities';

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
  private storageKey = 'calendar-events';

  private constructor() {
    this.loadEvents();
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

      const newEvent: CalendarEvent = {
        id: this.generateId(),
        ...eventData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.events.push(newEvent);
      this.saveEvents();

      return { data: newEvent };
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
        const validation = this.validateEventData(updateData as CreateEventData);
        if (!validation.isValid) {
          return {
            error: {
              code: 'validation-error',
              message: validation.error || 'Invalid event data'
            }
          };
        }
      }

      const updatedEvent: CalendarEvent = {
        ...this.events[eventIndex],
        ...updateData,
        updatedAt: new Date(),
      };

      this.events[eventIndex] = updatedEvent;
      this.saveEvents();

      return { data: updatedEvent };
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

      this.events.splice(eventIndex, 1);
      this.saveEvents();

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
   * Get all events
   */
  async getEvents(): Promise<CalendarServiceResponse<CalendarEvent[]>> {
    try {
      return { data: [...this.events] };
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
   */
  async getEventsByDate(date: string): Promise<CalendarServiceResponse<CalendarEvent[]>> {
    try {
      const events = this.events.filter(event => event.date === date);
      return { data: events };
    } catch (error) {
      console.error('Error getting events by date:', error);
      return {
        error: {
          code: 'fetch-error',
          message: 'Failed to fetch events for date'
        }
      };
    }
  }

  /**
   * Get upcoming events (sorted by date)
   */
  async getUpcomingEvents(limit: number = 5): Promise<CalendarServiceResponse<CalendarEvent[]>> {
    try {
      const sortedEvents = [...this.events].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      return { data: sortedEvents.slice(0, limit) };
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
      const events = this.events.filter(event => event.type === type);
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

  /**
   * Generate unique ID for events
   */
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Load events from localStorage
   */
  private loadEvents(): void {
    try {
      const savedEvents = localStorage.getItem(this.storageKey);
      if (savedEvents) {
        this.events = JSON.parse(savedEvents);
      }
    } catch (error) {
      console.error('Error loading events from localStorage:', error);
      this.events = [];
    }
  }

  /**
   * Save events to localStorage
   */
  private saveEvents(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.events));
    } catch (error) {
      console.error('Error saving events to localStorage:', error);
    }
  }
} 