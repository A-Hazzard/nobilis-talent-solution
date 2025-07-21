import { useState, useEffect, useCallback } from 'react';
import type { CalendarEvent } from '@/shared/types/entities';
import { CalendarService } from '@/lib/services/CalendarService';
import { CalendlyService } from '@/lib/services/CalendlyService';
import { CalendarUtils } from '@/lib/utils/calendarUtils';

export interface EventFormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  attendees: number;
  type: CalendarEvent['type'];
}

export interface CalendarState {
  events: CalendarEvent[];
  isLoading: boolean;
  currentMonth: Date;
  isModalOpen: boolean;
  editingEvent: CalendarEvent | null;
  form: EventFormData;
  formError: string | null;
  calendlyAuthStatus: 'connected' | 'disconnected' | 'error' | 'connecting';
  syncStatus: 'disconnected' | 'syncing' | 'success' | 'error';
  lastSyncTime: Date | null;
  syncStats: { synced: number; total: number };
  showInstructions: boolean;
  showCalendlyBooking: boolean;
  selectedEventType: any;
}

export interface CalendarActions {
  loadEvents: () => Promise<void>;
  syncCalendlyEvents: () => Promise<void>;
  connectCalendly: () => void;
  handleOpenModal: (event?: CalendarEvent) => void;
  handleCloseModal: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleDeleteEvent: (eventId: string) => Promise<void>;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTypeChange: (value: string) => void;
  handleTimeChange: (field: 'startTime' | 'endTime', value: string) => void;
  changeMonth: (direction: 'prev' | 'next') => void;
  openCalendlyBooking: () => Promise<void>;
  closeCalendlyBooking: () => void;
  toggleInstructions: () => void;
}

/**
 * Custom hook for calendar state management
 * Handles all calendar-related state and operations
 */
export function useCalendar(): [CalendarState, CalendarActions] {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState<EventFormData>({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    attendees: 1,
    type: 'workshop',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [calendlyAuthStatus, setCalendlyAuthStatus] = useState<'connected' | 'disconnected' | 'error' | 'connecting'>('connecting');
  const [syncStatus, setSyncStatus] = useState<'disconnected' | 'syncing' | 'success' | 'error'>('disconnected');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStats, setSyncStats] = useState<{ synced: number; total: number }>({ synced: 0, total: 0 });
  const [showInstructions, setShowInstructions] = useState(false);
  const [showCalendlyBooking, setShowCalendlyBooking] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<any>(null);

  const calendarService = CalendarService.getInstance();
  const calendlyService = CalendlyService.getInstance();

  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const localResponse = await calendarService.getEvents();
      const localEvents = localResponse.data || [];
      
      let allEvents = [...localEvents];
      
      if (calendlyAuthStatus === 'connected') {
        const result = await calendlyService.getScheduledEvents();
        
        if (!result.error && result.data) {
          const convertedEvents = result.data.map(event => 
            calendlyService.convertCalendlyEventToCalendarEvent(event)
          );
          allEvents = [...localEvents, ...convertedEvents];
        }
      }
      
      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  }, [calendlyAuthStatus, calendarService, calendlyService]);

  const syncCalendlyEvents = useCallback(async () => {
    try {
      setSyncStatus('syncing');
      
      const localResponse = await calendarService.getEvents();
      const localEvents = localResponse.data || [];
      
      const result = await calendlyService.getScheduledEvents();
      
      if (result.error) {
        setSyncStatus('error');
        return;
      }
      
      const convertedEvents = result.data.map(event => 
        calendlyService.convertCalendlyEventToCalendarEvent(event)
      );
      
      const allEvents = [...localEvents, ...convertedEvents];
      setEvents(allEvents);
      
      setSyncStats({ synced: convertedEvents.length, total: allEvents.length });
      setLastSyncTime(new Date());
      setSyncStatus('success');
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
    }
  }, [calendarService, calendlyService]);

  const connectCalendly = useCallback(() => {
    try {
      const authUrl = calendlyService.getAuthorizationUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error getting authorization URL:', error);
      setCalendlyAuthStatus('error');
    }
  }, [calendlyService]);

  const handleOpenModal = useCallback((event?: CalendarEvent) => {
    if (event) {
      if (event.calendlyUri) {
        setFormError('Cannot edit Calendly events. Please edit them directly in Calendly.');
        return;
      }
      
      setEditingEvent(event);
      const { startTime, endTime } = CalendarUtils.parseCalendlyTime(event.time);
      setForm({
        title: event.title,
        date: event.date,
        startTime,
        endTime,
        location: event.location,
        attendees: event.attendees,
        type: event.type,
      });
    } else {
      setForm({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        attendees: 1,
        type: 'workshop',
      });
      setFormError(null);
      setEditingEvent(null);
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setForm({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      attendees: 1,
      type: 'workshop',
    });
    setFormError(null);
    setEditingEvent(null);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.startTime || !form.endTime) {
      setFormError('Please select both start and end times');
      return;
    }

    if (!CalendarUtils.validateTimeRange(form.startTime, form.endTime, form.date)) {
      setFormError('End time must be after start time');
      return;
    }

    try {
      if (editingEvent) {
        if (editingEvent.calendlyUri) {
          setFormError('Cannot edit Calendly events. Please edit them directly in Calendly.');
          return;
        }

        await calendarService.updateEvent({
          id: editingEvent.id,
          title: form.title,
          date: form.date,
          time: `${form.startTime} - ${form.endTime}`,
          location: form.location,
          attendees: form.attendees,
          type: form.type,
        });
      } else {
        const newEvent: Omit<CalendarEvent, 'id'> = {
          title: form.title,
          date: form.date,
          time: `${form.startTime} - ${form.endTime}`,
          location: form.location,
          attendees: form.attendees,
          type: form.type,
          status: 'confirmed',
          createdBy: 'local',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await calendarService.createEvent(newEvent);
      }
      
      await loadEvents();
      
      if (calendlyAuthStatus === 'connected') {
        await syncCalendlyEvents();
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving event:', error);
      setFormError('Failed to save event');
    }
  }, [form, editingEvent, calendlyAuthStatus, calendarService, loadEvents, syncCalendlyEvents, handleCloseModal]);

  const handleDeleteEvent = useCallback(async (eventId: string) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      if (event.calendlyUri) {
        if (calendlyAuthStatus !== 'connected') return;

        const deleteResult = await calendlyService.cancelEvent(event.calendlyUri);
        if (deleteResult.error) return;
      } else {
        await calendarService.deleteEvent(eventId);
      }

      await loadEvents();
      
      if (calendlyAuthStatus === 'connected') {
        await syncCalendlyEvents();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  }, [events, calendlyAuthStatus, calendarService, calendlyService, loadEvents, syncCalendlyEvents]);

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setFormError(null);
  }, []);

  const handleTypeChange = useCallback((value: string) => {
    setForm(prev => ({ ...prev, type: value as CalendarEvent['type'] }));
    setFormError(null);
  }, []);

  const handleTimeChange = useCallback((field: 'startTime' | 'endTime', value: string) => {
    setForm(prev => {
      const newForm = { ...prev, [field]: value };
      
      if (newForm.startTime && newForm.endTime && newForm.date) {
        if (!CalendarUtils.validateTimeRange(newForm.startTime, newForm.endTime, newForm.date)) {
          if (field === 'startTime') {
            newForm.endTime = '';
          } else {
            newForm.startTime = '';
          }
          setFormError('End time must be after start time');
        } else {
          setFormError(null);
        }
      }
      
      return newForm;
    });
  }, []);

  const changeMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  }, []);

  const openCalendlyBooking = useCallback(async () => {
    try {
      const eventTypes = await calendlyService.getEventTypes();
      if (eventTypes.data && eventTypes.data.length > 0) {
        setSelectedEventType(eventTypes.data[0]);
        setShowCalendlyBooking(true);
      } else {
        alert('No Calendly event types found. Please create an event type in Calendly first.');
      }
    } catch (error) {
      console.error('Error opening Calendly booking:', error);
      alert('Error connecting to Calendly. Please try again.');
    }
  }, [calendlyService]);

  const closeCalendlyBooking = useCallback(() => {
    setShowCalendlyBooking(false);
    setSelectedEventType(null);
  }, []);

  const toggleInstructions = useCallback(() => {
    setShowInstructions(prev => !prev);
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const state: CalendarState = {
    events,
    isLoading,
    currentMonth,
    isModalOpen,
    editingEvent,
    form,
    formError,
    calendlyAuthStatus,
    syncStatus,
    lastSyncTime,
    syncStats,
    showInstructions,
    showCalendlyBooking,
    selectedEventType,
  };

  const actions: CalendarActions = {
    loadEvents,
    syncCalendlyEvents,
    connectCalendly,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDeleteEvent,
    handleFormChange,
    handleTypeChange,
    handleTimeChange,
    changeMonth,
    openCalendlyBooking,
    closeCalendlyBooking,
    toggleInstructions,
  };

  return [state, actions];
} 