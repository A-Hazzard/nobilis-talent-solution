import { CalendarService } from '@/lib/services/CalendarService';
import type { CalendarEvent } from '@/shared/types/entities';
import type { CreateEventData, UpdateEventData } from '@/lib/types/services';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  where 
} from 'firebase/firestore';
import { logAdminAction } from '@/lib/helpers/auditLogger';

// Mock Firebase modules
jest.mock('firebase/firestore');
jest.mock('@/lib/firebase/config', () => ({
  db: {},
}));
jest.mock('@/lib/helpers/auditLogger');

const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
const mockWhere = where as jest.MockedFunction<typeof where>;
const mockLogAdminAction = logAdminAction as jest.MockedFunction<typeof logAdminAction>;

describe('CalendarService', () => {
  let calendarService: CalendarService;

  beforeEach(() => {
    calendarService = CalendarService.getInstance();
    jest.clearAllMocks();
    // Clear the events array
    (calendarService as any).events = [];
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = CalendarService.getInstance();
      const instance2 = CalendarService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('createEvent', () => {
    const mockCreateEventData: CreateEventData = {
      title: 'Leadership Workshop',
      description: 'Team leadership development session',
      date: '2024-02-15',
      time: '10:00',
      duration: 120,
      location: 'Conference Room A',
      type: 'workshop',
      attendees: ['john@example.com', 'jane@example.com'],
      maxAttendees: 10,
      isRecurring: false,
      status: 'scheduled',
      createdBy: 'admin-user-id',
    };

    it('should create event successfully', async () => {
      mockCollection.mockReturnValue('calendar-events' as any);
      mockAddDoc.mockResolvedValue({ id: 'event-123' } as any);

      const result = await calendarService.createEvent(mockCreateEventData);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('event-123');
      expect(result.data?.title).toBe('Leadership Workshop');
      expect(mockAddDoc).toHaveBeenCalled();
      expect(mockLogAdminAction).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const invalidEventData = {
        ...mockCreateEventData,
        title: '   ', // Invalid empty title (whitespace only)
      };

      const result = await calendarService.createEvent(invalidEventData);

      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('validation-error');
      expect(result.error?.message).toBe('Title is required');
      expect(result.data).toBeUndefined();
      expect(mockAddDoc).not.toHaveBeenCalled();
    });

    it('should handle Firebase errors', async () => {
      mockCollection.mockReturnValue('calendar-events' as any);
      mockAddDoc.mockRejectedValue(new Error('Firebase error'));

      const result = await calendarService.createEvent(mockCreateEventData);

      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('create-error');
      expect(result.error?.message).toBe('Failed to create event');
      expect(result.data).toBeUndefined();
    });

    it('should add created event to local events array', async () => {
      mockCollection.mockReturnValue('calendar-events' as any);
      mockAddDoc.mockResolvedValue({ id: 'event-123' } as any);

      await calendarService.createEvent(mockCreateEventData);

      const events = (calendarService as any).events;
      expect(events).toHaveLength(1);
      expect(events[0].id).toBe('event-123');
      expect(events[0].title).toBe('Leadership Workshop');
    });
  });

  describe('updateEvent', () => {
    beforeEach(() => {
      // Setup initial event in local array
      (calendarService as any).events = [{
        id: 'event-123',
        title: 'Original Title',
        description: 'Original description',
        date: '2024-02-15',
        time: '10:00',
        duration: 120,
        location: 'Room A',
        type: 'workshop',
        attendees: [],
        maxAttendees: 10,
        isRecurring: false,
        status: 'scheduled',
        createdBy: 'admin-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      }];
    });

    it('should update event successfully', async () => {
      const updateData: UpdateEventData = {
        id: 'event-123',
        title: 'Updated Workshop Title',
        location: 'Conference Room B',
      };

      mockDoc.mockReturnValue('doc-ref' as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await calendarService.updateEvent(updateData);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data?.title).toBe('Updated Workshop Title');
      expect(result.data?.location).toBe('Conference Room B');
      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(mockLogAdminAction).toHaveBeenCalled();
    });

    it('should handle event not found', async () => {
      const updateData: UpdateEventData = {
        id: 'non-existent-event',
        title: 'Updated Title',
      };

      const result = await calendarService.updateEvent(updateData);

      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('not-found');
      expect(result.error?.message).toBe('Event not found');
      expect(result.data).toBeUndefined();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    it('should handle Firebase update errors', async () => {
      const updateData: UpdateEventData = {
        id: 'event-123',
        title: 'Updated Title',
      };

      mockDoc.mockReturnValue('doc-ref' as any);
      mockUpdateDoc.mockRejectedValue(new Error('Firebase error'));

      const result = await calendarService.updateEvent(updateData);

      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('update-error');
      expect(result.error?.message).toBe('Failed to update event');
      expect(result.data).toBeUndefined();
    });
  });

  describe('deleteEvent', () => {
    beforeEach(() => {
      // Setup initial events in local array
      (calendarService as any).events = [
        {
          id: 'event-123',
          title: 'Event to Delete',
          date: '2024-02-15',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'event-456',
          title: 'Keep This Event',
          date: '2024-02-16',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    });

    it('should delete event successfully', async () => {
      mockDoc.mockReturnValue('doc-ref' as any);
      mockDeleteDoc.mockResolvedValue(undefined);

      const result = await calendarService.deleteEvent('event-123');

      expect(result.error).toBeUndefined();
      expect(mockDeleteDoc).toHaveBeenCalledWith('doc-ref');
      expect(mockLogAdminAction).toHaveBeenCalled();

      // Check event removed from local array
      const events = (calendarService as any).events;
      expect(events).toHaveLength(1);
      expect(events[0].id).toBe('event-456');
    });

    it('should handle event not found for deletion', async () => {
      const result = await calendarService.deleteEvent('non-existent-event');

      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('not-found');
      expect(result.error?.message).toBe('Event not found');
      expect(mockDeleteDoc).not.toHaveBeenCalled();
    });

    it('should handle Firebase delete errors', async () => {
      mockDoc.mockReturnValue('doc-ref' as any);
      mockDeleteDoc.mockRejectedValue(new Error('Firebase error'));

      const result = await calendarService.deleteEvent('event-123');

      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('delete-error');
      expect(result.error?.message).toBe('Failed to delete event');
    });
  });

  describe('getEvents', () => {
    it('should fetch events from Firebase successfully', async () => {
      const mockEvents = [
        {
          id: 'event-123',
          title: 'Event 1',
          date: '2024-02-15',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'event-456',
          title: 'Event 2',
          date: '2024-02-16',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQuerySnapshot = {
        forEach: jest.fn((callback) => {
          mockEvents.forEach((event, index) => {
            callback({
              id: event.id,
              data: () => ({
                ...event,
                createdAt: { toDate: () => event.createdAt },
                updatedAt: { toDate: () => event.updatedAt },
              }),
            });
          });
        }),
      };

      mockCollection.mockReturnValue('calendar-events' as any);
      mockQuery.mockReturnValue('query' as any);
      mockOrderBy.mockReturnValue('orderBy' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await calendarService.getEvents();

      expect(result.error).toBeUndefined();
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].title).toBe('Event 1');
    });

    it('should handle Firebase fetch errors', async () => {
      mockCollection.mockReturnValue('calendar-events' as any);
      mockQuery.mockReturnValue('query' as any);
      mockOrderBy.mockReturnValue('orderBy' as any);
      mockGetDocs.mockRejectedValue(new Error('Firebase error'));

      const result = await calendarService.getEvents();

      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('fetch-error');
      expect(result.error?.message).toBe('Failed to fetch events');
    });
  });

  describe('getUpcomingEvents', () => {
    it('should fetch upcoming events from Firebase successfully', async () => {
      const mockEvents = [
        {
          id: 'event-upcoming',
          title: 'Upcoming Event',
          date: '2024-12-15',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQuerySnapshot = {
        forEach: jest.fn((callback) => {
          mockEvents.forEach((event) => {
            callback({
              id: event.id,
              data: () => ({
                ...event,
                createdAt: { toDate: () => event.createdAt },
                updatedAt: { toDate: () => event.updatedAt },
              }),
            });
          });
        }),
      };

      mockCollection.mockReturnValue('calendar-events' as any);
      mockQuery.mockReturnValue('query' as any);
      mockWhere.mockReturnValue('where' as any);
      mockOrderBy.mockReturnValue('orderBy' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await calendarService.getUpcomingEvents(5);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
    });
  });
});
