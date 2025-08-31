import { useState, useEffect, useCallback } from 'react';
import type { CalendarEvent } from '@/shared/types/entities';
import type { EventFormData, CalendarState, CalendarActions } from '@/lib/types/hooks';
import { CalendarService } from '@/lib/services/CalendarService';
import { CalendlyService } from '@/lib/services/CalendlyService';
import { CalendarUtils } from '@/lib/utils/calendarUtils';
import { logAdminAction } from '@/lib/helpers/auditLogger';

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
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [maxConnectionAttempts] = useState(2);
  const [isClient, setIsClient] = useState(false);

  const calendarService = CalendarService.getInstance();
  const calendlyService = CalendlyService.getInstance();

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
    console.log('🌐 useCalendar hook initialized on client side');
  }, []);

  /**
   * Check Calendly connection status
   */
  const checkCalendlyConnection = useCallback(async () => {
    try {
      console.log('🔍 Checking Calendly connection...');
      console.log('🌐 Current environment:', typeof window !== 'undefined' ? 'client' : 'server');
      
      // Check if we have a stored token
      const storedToken = localStorage.getItem('calendly_access_token');
      console.log('📝 Stored token found:', !!storedToken);
      
      if (storedToken) {
        console.log('📝 Found stored token, testing connection...');
        console.log('🔑 Token length:', storedToken.length);
        calendlyService.setAccessToken(storedToken);
        
        // Test the connection by getting user info
        console.log('👤 Testing connection with getUserInfo...');
        const userInfo = await calendlyService.getUserInfo();
        console.log('👤 User info response:', userInfo);
        
        if (userInfo.data && !userInfo.error) {
          console.log('✅ Calendly connection successful!');
          console.log('👤 User data:', userInfo.data);
          setCalendlyAuthStatus('connected');
          setConnectionAttempts(0);
          return 'connected';
        } else {
          console.log('❌ Stored token is invalid, removing...');
          console.log('❌ Error details:', userInfo.error);
          // Token is invalid, remove it
          localStorage.removeItem('calendly_access_token');
          setCalendlyAuthStatus('disconnected');
          return 'disconnected';
        }
      } else {
        console.log('📝 No stored token found');
        setCalendlyAuthStatus('disconnected');
        return 'disconnected';
      }
    } catch (error) {
      console.error('❌ Error checking Calendly connection:', error);
      setCalendlyAuthStatus('error');
      return 'error';
    }
  }, [calendlyService]);

  const loadEvents = useCallback(async (forceConnectionStatus?: 'connected' | 'disconnected' | 'error') => {
    try {
      setIsLoading(true);
      console.log('📅 Loading events...');
      
      const localResponse = await calendarService.getEvents();
      const localEvents = localResponse.data || [];
      console.log(`📅 Loaded ${localEvents.length} local events`);
      
      let allEvents = [...localEvents];
      
      // Use the passed connection status or fall back to state
      const isConnected = forceConnectionStatus === 'connected' || calendlyAuthStatus === 'connected';
      
      // Only try to load Calendly events if we're connected
      if (isConnected) {
        console.log('🔄 Loading Calendly events...');
        try {
          const result = await calendlyService.getScheduledEvents();
          
          if (!result.error && result.data) {
            const convertedEvents = result.data.map(event => 
              calendlyService.convertCalendlyEventToCalendarEvent(event)
            );
            console.log(`🔄 Loaded ${convertedEvents.length} Calendly events`);
            allEvents = [...localEvents, ...convertedEvents];
          } else {
            console.log('❌ Error loading Calendly events:', result.error);
          }
        } catch (error) {
          console.error('Error loading Calendly events:', error);
          // Don't fail the entire load if Calendly fails
        }
      } else {
        console.log('📝 Skipping Calendly events - not connected');
      }
      
      console.log(`📅 Total events loaded: ${allEvents.length}`);
      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  }, [calendlyAuthStatus, calendarService, calendlyService]);

  const syncCalendlyEvents = useCallback(async () => {
    try {
      console.log('🔄 Starting Calendly sync...');
      setSyncStatus('syncing');
      
      const localResponse = await calendarService.getEvents();
      const localEvents = localResponse.data || [];
      console.log(`📅 Found ${localEvents.length} local events`);
      
      const result = await calendlyService.getScheduledEvents();
      
      if (result.error) {
        console.error('❌ Calendly sync error:', result.error);
        setSyncStatus('error');
        return;
      }
      
      const convertedEvents = result.data.map(event => 
        calendlyService.convertCalendlyEventToCalendarEvent(event)
      );
      console.log(`🔄 Synced ${convertedEvents.length} Calendly events`);
      
      const allEvents = [...localEvents, ...convertedEvents];
      setEvents(allEvents);
      
      setSyncStats({ synced: convertedEvents.length, total: allEvents.length });
      setLastSyncTime(new Date());
      setSyncStatus('success');
      console.log('✅ Calendly sync completed successfully');
    } catch (error) {
      console.error('❌ Sync error:', error);
      setSyncStatus('error');
    }
  }, [calendarService, calendlyService]);

  const connectCalendly = useCallback(() => {
    try {
      console.log('🔄 Initiating Calendly connection...');
      const authUrl = calendlyService.getAuthorizationUrl();
      console.log('🔗 Authorization URL:', authUrl);
      window.location.href = authUrl;
    } catch (error) {
      console.error('❌ Error getting authorization URL:', error);
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
    
    if (!form.title || !form.date || !form.startTime || !form.endTime) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (!CalendarUtils.validateTimeRange(form.startTime, form.endTime, form.date)) {
      setFormError('End time must be after start time');
      return;
    }

    try {
      const eventData = {
        title: form.title,
        date: form.date,
        time: `${form.startTime} - ${form.endTime}`,
        location: form.location,
        attendees: form.attendees,
        type: form.type,
      };

      if (editingEvent) {
        await calendarService.updateEvent({
          id: editingEvent.id,
          ...eventData,
        });
        
        // Log audit action for update
        await logAdminAction({
          action: 'update',
          entity: 'calendar',
          entityId: editingEvent.id,

          details: {
            title: `Calendar event updated: ${eventData.title}`,
            eventTitle: eventData.title,
            eventDate: eventData.date,
            eventType: eventData.type,
            previousTitle: editingEvent.title,
          },
        });
      } else {
        const response = await calendarService.createEvent({
          ...eventData,
          createdBy: 'local',
        });
        
        if (response.data) {
          // Log audit action for create
          await logAdminAction({
            action: 'create',
            entity: 'calendar',
            entityId: response.data.id,
  
            details: {
              title: `Calendar event created: ${eventData.title}`,
              eventTitle: eventData.title,
              eventDate: eventData.date,
              eventType: eventData.type,
            },
          });
        }
      }

      handleCloseModal();
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      setFormError('Failed to save event. Please try again.');
    }
  }, [form, editingEvent, calendarService, handleCloseModal, loadEvents]);

  const handleDeleteEvent = useCallback(async (eventId: string) => {
    try {
      // Get event details before deletion for audit log
      const eventToDelete = events.find(event => event.id === eventId);
      
      await calendarService.deleteEvent(eventId);
      
      // Log audit action
      if (eventToDelete) {
        await logAdminAction({
          action: 'delete',
          entity: 'calendar',
          entityId: eventId,

          details: {
            title: `Calendar event deleted: ${eventToDelete.title}`,
            eventTitle: eventToDelete.title,
            eventDate: eventToDelete.date,
            eventType: eventToDelete.type,
          },
        });
      }
      
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  }, [calendarService, loadEvents, events]);

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

  const openCalendlyBooking = useCallback(() => {
    // Direct redirect to Calendly scheduling page
    window.open('https://calendly.com/app/scheduling/meeting_types/user/me', '_blank');
  }, []);

  const closeCalendlyBooking = useCallback(() => {
    // No longer needed since we removed the modal
  }, []);

  const toggleInstructions = useCallback(() => {
    setShowInstructions(prev => !prev);
  }, []);

  // Initial load and connection check
  useEffect(() => {
    if (!isClient) return; // Don't run on server side
    
    const initializeCalendar = async () => {
      try {
        console.log('🚀 Starting calendar initialization...');
        setIsLoading(true);
        
        // First check Calendly connection and wait for it to complete
        console.log('🔍 Checking Calendly connection during initialization...');
        const connectionStatus = await checkCalendlyConnection();
        console.log(`🔍 Connection status: ${connectionStatus}`);
        
        // Then load events with the connection status (this will include Calendly events if connected)
        console.log('📅 Loading events with connection status...');
        await loadEvents(connectionStatus);
        
        // If we're connected, auto-sync to get the latest events
        if (connectionStatus === 'connected') {
          console.log('🔄 Auto-syncing Calendly events after initialization...');
          await syncCalendlyEvents();
        } else {
          console.log('📝 Skipping auto-sync - not connected to Calendly');
        }
        
        console.log('✅ Calendar initialization complete');
      } catch (error) {
        console.error('❌ Error initializing calendar:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCalendar();
  }, [isClient]); // Only depend on isClient to ensure it runs once when client is ready

  // Retry connection logic
  useEffect(() => {
    if (!isClient) return; // Don't run on server side
    
    if (calendlyAuthStatus === 'disconnected' && connectionAttempts < maxConnectionAttempts) {
      const retryConnection = async () => {
        console.log(`🔄 Retry attempt ${connectionAttempts + 1}/${maxConnectionAttempts}...`);
        setConnectionAttempts(prev => prev + 1);
        setCalendlyAuthStatus('connecting');
        
        try {
          const connectionStatus = await checkCalendlyConnection();
          // If reconnection is successful, auto-sync
          if (connectionStatus === 'connected') {
            console.log('🔄 Auto-syncing after successful reconnection...');
            await syncCalendlyEvents();
          }
        } catch (error) {
          console.error('❌ Connection retry failed:', error);
          setCalendlyAuthStatus('error');
        }
      };

      const timeoutId = setTimeout(retryConnection, 2000 * connectionAttempts); // Exponential backoff
      return () => clearTimeout(timeoutId);
    }
  }, [calendlyAuthStatus, connectionAttempts, maxConnectionAttempts, checkCalendlyConnection, syncCalendlyEvents, isClient]);

  // Auto-sync when connection is established (separate from initialization)
  useEffect(() => {
    if (!isClient) return; // Don't run on server side
    
    if (calendlyAuthStatus === 'connected' && syncStatus === 'disconnected' && !isLoading) {
      console.log('🔄 Auto-syncing Calendly events after successful connection...');
      // Auto-sync when we first connect (but not during initial load)
      syncCalendlyEvents();
    }
  }, [calendlyAuthStatus, syncStatus, syncCalendlyEvents, isLoading, isClient]);

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
    connectionAttempts,
    maxConnectionAttempts,
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
    checkCalendlyConnection,
  };

  return [state, actions];
} 