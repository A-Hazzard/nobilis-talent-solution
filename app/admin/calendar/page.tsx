'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarIcon, 
  Plus, 
  Users, 
  MapPin, 
  Clock, 
  Info, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Link, 
  Trash2,
  Edit
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { CalendarEvent } from '@/shared/types/entities';
import { CalendarService } from '@/lib/services/CalendarService';
import { CalendlyService } from '@/lib/services/CalendlyService';
import { useUserStore } from '@/lib/stores/userStore';
import CalendlyWidget from '@/components/admin/CalendlyWidget';

// Utility function to parse Calendly time format
const parseCalendlyTime = (timeString: string) => {
  if (!timeString) return { startTime: '', endTime: '' };
  
  // Handle format like "10:00:00 am - 10:30:00 am"
  const parts = timeString.split(' - ');
  if (parts.length !== 2) return { startTime: '', endTime: '' };
  
  const parseTime = (timeStr: string) => {
    // Remove seconds and convert to 24-hour format
    const time = timeStr.trim().toLowerCase();
    const [timePart, period] = time.split(' ');
    const [hours, minutes] = timePart.split(':');
    let hour = parseInt(hours);
    
    if (period === 'pm' && hour !== 12) {
      hour += 12;
    } else if (period === 'am' && hour === 12) {
      hour = 0;
    }
    
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };
  
  return {
    startTime: parseTime(parts[0]),
    endTime: parseTime(parts[1])
  };
};

type EventFormData = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  attendees: number;
  type: CalendarEvent['type'];
};

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [calendlyAuthStatus, setCalendlyAuthStatus] = useState<'connected' | 'disconnected' | 'error' | 'connecting'>('connecting');
  const [showInstructions, setShowInstructions] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStats, setSyncStats] = useState<{ synced: number; total: number }>({ synced: 0, total: 0 });
  const [showCalendlyBooking, setShowCalendlyBooking] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<'disconnected' | 'syncing' | 'success' | 'error'>('disconnected');

  const { user } = useUserStore();
  const calendarService = CalendarService.getInstance();
  const calendlyService = CalendlyService.getInstance();

  const syncCalendlyEvents = async () => {
    try {
      setSyncStatus('syncing');
      
      // First, get current local events to preserve them
      console.log('📊 Loading local events to preserve during sync...');
      const localResponse = await calendarService.getEvents();
      const localEvents = localResponse.data || [];
      console.log('📅 Local events to preserve:', localEvents);
      
      // Load events from Calendly API
      const result = await calendlyService.getScheduledEvents();
      
      if (result.error) {
        console.error('Error loading Calendly events:', result.error);
        setSyncStatus('error');
        return;
      }
      
      console.log('📊 Raw Calendly events:', result.data);
      
      // Convert Calendly events to our format
      const convertedEvents = result.data.map(event => {
        const converted = calendlyService.convertCalendlyEventToCalendarEvent(event);
        console.log('🔄 Converting event:', event.name, 'to:', converted);
        return converted;
      });
      
      console.log('📅 Converted Calendly events:', convertedEvents);
      
      // Combine local and Calendly events
      const allEvents = [...localEvents, ...convertedEvents];
      console.log('📅 Final combined events:', allEvents);
      
      setEvents(allEvents);
      
      setSyncStats({ synced: convertedEvents.length, total: allEvents.length });
      setLastSyncTime(new Date());
      setSyncStatus('success');
      
      console.log(`🎉 Sync complete! ${convertedEvents.length} Calendly events + ${localEvents.length} local events = ${allEvents.length} total events.`);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
    }
  };

  // Auto-connect to Calendly on page load
  useEffect(() => {
    const autoConnectCalendly = async () => {
      try {
        console.log('🔄 Attempting automatic Calendly connection...');
        setCalendlyAuthStatus('connecting');
        
        // Check if we have a stored token
        const storedToken = localStorage.getItem('calendly_access_token');
        if (storedToken) {
          console.log('🔑 Found stored Calendly token, attempting to use it...');
          calendlyService.setAccessToken(storedToken);
          
          // Test the token by getting user info
          const userInfo = await calendlyService.getUserInfo();
          if (userInfo.data) {
            console.log('✅ Stored token is valid, connected to Calendly');
            setCalendlyAuthStatus('connected');
            // Auto-sync events once connected
            await syncCalendlyEvents();
            return;
          } else {
            console.log('❌ Stored token is invalid, removing it');
            localStorage.removeItem('calendly_access_token');
          }
        }
        
        // If no valid token, try to connect automatically
        console.log('🔗 No valid token found, attempting automatic connection...');
        const authUrl = calendlyService.getAuthorizationUrl();
        window.location.href = authUrl;
        
      } catch (error) {
        console.error('❌ Auto-connection failed:', error);
        setCalendlyAuthStatus('disconnected');
      }
    };

    // Only auto-connect if not already connected and no OAuth callback is in progress
    if (calendlyAuthStatus === 'connecting' && !searchParams.get('success') && !searchParams.get('error')) {
      autoConnectCalendly();
    }
  }, [calendlyAuthStatus, calendlyService, searchParams]);

  // Handle OAuth callback
  useEffect(() => {
    const success = searchParams.get('success');
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (success && token) {
      calendlyService.setAccessToken(token);
      setCalendlyAuthStatus('connected');
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      // Auto-sync events after successful connection
      syncCalendlyEvents();
    } else if (error) {
      setCalendlyAuthStatus('error');
      console.error('Calendly OAuth error:', error);
    }
  }, [searchParams, calendlyService]);

  // Load events on component mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      
      // Always load local events from Firebase first
      console.log('📊 Loading local events from Firebase...');
      const localResponse = await calendarService.getEvents();
      
      if (localResponse.error) {
        console.error('Error loading local events:', localResponse.error);
      }
      
      const localEvents = localResponse.data || [];
      console.log('📅 Local events loaded:', localEvents);
      
      let allEvents = [...localEvents];
      
      // If Calendly is connected, also load Calendly events
      if (calendlyAuthStatus === 'connected') {
        console.log('📊 Loading Calendly events...');
        const result = await calendlyService.getScheduledEvents();
        
        if (result.error) {
          console.error('Error loading Calendly events:', result.error);
        } else {
          console.log('📊 Raw Calendly events:', result.data);
          
          // Convert Calendly events to our format
          const convertedEvents = result.data.map(event => {
            const converted = calendlyService.convertCalendlyEventToCalendarEvent(event);
            console.log('🔄 Converting event:', event.name, 'to:', converted);
            return converted;
          });
          
          console.log('📅 Converted Calendly events:', convertedEvents);
          
          // Combine local and Calendly events
          allEvents = [...localEvents, ...convertedEvents];
        }
      }
      
      console.log('📅 Final combined events:', allEvents);
      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectCalendly = () => {
    try {
      const authUrl = calendlyService.getAuthorizationUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error getting authorization URL:', error);
      setCalendlyAuthStatus('error');
    }
  };

  const handleCalendlyEventScheduled = async (eventDetails: any) => {
    console.log('Calendly event scheduled:', eventDetails);
    // Optionally sync events immediately when a new one is scheduled
    await syncCalendlyEvents();
  };

  const resetForm = () => {
    setForm({ title: '', date: '', startTime: '', endTime: '', location: '', attendees: 1, type: 'workshop' });
    setFormError(null);
    setEditingEvent(null);
  };

  const handleOpenModal = (event?: CalendarEvent) => {
    if (event) {
      // Only allow editing local events (not Calendly events)
      if (event.calendlyUri) {
        setFormError('Cannot edit Calendly events. Please edit them directly in Calendly.');
        return;
      }
      
      setEditingEvent(event);
      const { startTime, endTime } = parseCalendlyTime(event.time);
      setForm({
        title: event.title,
        date: event.date,
        startTime: startTime,
        endTime: endTime,
        location: event.location,
        attendees: event.attendees,
        type: event.type,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
  };

  const handleTypeChange = (value: string) => {
    setForm((prev) => ({ ...prev, type: value as CalendarEvent['type'] }));
    setFormError(null);
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    setForm(prev => {
      const newForm = { ...prev, [field]: value };
      
      // Validate time range when both times are set
      if (newForm.startTime && newForm.endTime && newForm.date) {
        const startDateTime = new Date(`${newForm.date}T${newForm.startTime}`);
        const endDateTime = new Date(`${newForm.date}T${newForm.endTime}`);
        
        if (endDateTime <= startDateTime) {
          // If end time is before or equal to start time, clear the end time
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
  };

  const TimePicker = ({ 
    value, 
    onChange, 
    placeholder 
  }: { 
    value: string; 
    onChange: (value: string) => void; 
    placeholder: string; 
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const timeOptions = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        timeOptions.push({ value: time, display: displayTime });
      }
    }

    const displayValue = value ? new Date(`2000-01-01T${value}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) : placeholder;

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-10 px-3 py-2",
              !value && "text-muted-foreground"
            )}
          >
            <Clock className="mr-2 h-4 w-4 text-gray-500" />
            {displayValue}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-0" align="start">
          <div className="max-h-60 overflow-y-auto">
            {timeOptions.map((option) => (
              <Button
                key={option.value}
                variant={option.value === value ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-9 px-3",
                  option.value === value && "bg-primary text-primary-foreground"
                )}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.display}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setFormError('User not authenticated');
      return;
    }

    // Validate time inputs
    if (!form.startTime || !form.endTime) {
      setFormError('Please select both start and end times');
      return;
    }

    const startDateTime = new Date(`${form.date}T${form.startTime}`);
    const endDateTime = new Date(`${form.date}T${form.endTime}`);
    
    // Validate the dates
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      setFormError('Invalid time format. Please select valid times.');
      return;
    }

    // Validate that end time is after start time
    if (endDateTime <= startDateTime) {
      setFormError('End time must be after start time');
      return;
    }

    console.log('🕐 Parsed times:', {
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString()
    });

    try {
      if (editingEvent) {
        // Update existing local event (not Calendly)
        if (editingEvent.calendlyUri) {
          setFormError('Cannot edit Calendly events. Please edit them directly in Calendly.');
          return;
        }

        console.log('✏️ Updating local event:', {
          id: editingEvent.id,
          title: form.title,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime
        });

        // Update local event in Firebase
        const updatedEvent: CalendarEvent = {
          ...editingEvent,
          title: form.title,
          date: form.date,
          time: `${form.startTime} - ${form.endTime}`,
          location: form.location,
          attendees: form.attendees,
          type: form.type,
          updatedAt: new Date(),
        };

        await calendarService.updateEvent({
          id: editingEvent.id,
          title: form.title,
          date: form.date,
          time: `${form.startTime} - ${form.endTime}`,
          location: form.location,
          attendees: form.attendees,
          type: form.type,
        });
        console.log('✅ Local event updated successfully');
      } else {
        // Create new local event
        console.log('➕ Creating new local event:', {
          title: form.title,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime
        });

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
        console.log('✅ Local event created successfully');
      }
      
      // Reload events and sync Calendly
      await loadEvents();
      
      // Sync Calendly events if connected
      if (calendlyAuthStatus === 'connected') {
        console.log('🔄 Syncing Calendly events after local event change...');
        await syncCalendlyEvents();
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving event:', error);
      setFormError('Failed to save event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) {
        console.error('Event not found:', eventId);
        return;
      }

      if (event.calendlyUri) {
        // Delete Calendly event
        if (calendlyAuthStatus !== 'connected') {
          console.error('Calendly not connected');
          return;
        }

        console.log('🗑️ Deleting Calendly event:', event.calendlyUri);
        const deleteResult = await calendlyService.cancelEvent(event.calendlyUri);
        
        if (deleteResult.error) {
          console.error('❌ Calendly delete error:', deleteResult.error);
          return;
        }

        console.log('✅ Calendly event deleted successfully');
      } else {
        // Delete local event
        console.log('🗑️ Deleting local event:', eventId);
        await calendarService.deleteEvent(eventId);
        console.log('✅ Local event deleted successfully');
      }

      // Reload events and sync Calendly
      await loadEvents();
      
      // Sync Calendly events if connected
      if (calendlyAuthStatus === 'connected') {
        console.log('🔄 Syncing Calendly events after event deletion...');
        await syncCalendlyEvents();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleQuickAction = (type: CalendarEvent['type']) => {
    const today = new Date().toISOString().split('T')[0];
    setForm({
      title: '',
      date: today,
      startTime: '',
      endTime: '',
      location: '',
      attendees: 1,
      type,
    });
    setIsModalOpen(true);
  };

  const openCalendlyBooking = async () => {
    try {
      // Get available event types from Calendly
      const eventTypes = await calendlyService.getEventTypes();
      if (eventTypes.data && eventTypes.data.length > 0) {
        setSelectedEventType(eventTypes.data[0]); // Use first available event type
        setShowCalendlyBooking(true);
      } else {
        alert('No Calendly event types found. Please create an event type in Calendly first.');
      }
    } catch (error) {
      console.error('Error opening Calendly booking:', error);
      alert('Error connecting to Calendly. Please try again.');
    }
  };

  const closeCalendlyBooking = () => {
    setShowCalendlyBooking(false);
    setSelectedEventType(null);
  };

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case 'workshop':
        return <Badge variant="default">Workshop</Badge>;
      case 'consultation':
        return <Badge variant="secondary">Consultation</Badge>;
      case 'training':
        return <Badge variant="outline">Training</Badge>;
      case 'meeting':
        return <Badge variant="destructive">Meeting</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'workshop':
        return 'border-l-blue-500';
      case 'consultation':
        return 'border-l-green-500';
      case 'training':
        return 'border-l-purple-500';
      case 'meeting':
        return 'border-l-red-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const getEventSourceBadge = (event: CalendarEvent) => {
    if (event.calendlyUri) {
      return <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Calendly</Badge>;
    } else {
      return <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Local</Badge>;
    }
  };

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const formatDate = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const getMonthName = () => {
    return currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  // Sort events by date for upcoming events, excluding canceled events
  const sortedEvents = [...events]
    .filter(event => event.status !== 'canceled') // Exclude canceled events
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const upcomingEvents = sortedEvents.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <CalendarIcon className="h-12 w-12 mx-auto mb-4 animate-spin" />
          <p>Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {calendlyAuthStatus === 'connecting' && (
            <Button
              variant="outline"
              disabled
              className="bg-gray-50 text-gray-500 border-gray-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </Button>
          )}
          {calendlyAuthStatus === 'connected' && (
            <Button 
              onClick={syncCalendlyEvents}
              disabled={syncStatus === 'syncing'}
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Calendly'}
            </Button>
          )}
          {calendlyAuthStatus === 'disconnected' && (
            <Button 
              variant="outline" 
              onClick={connectCalendly}
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              <Link className="h-4 w-4 mr-2" />
              Connect Calendly
            </Button>
          )}
          {calendlyAuthStatus === 'error' && (
            <Button 
              variant="outline" 
              onClick={connectCalendly}
              className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
            >
              <Link className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={openCalendlyBooking}
            disabled={calendlyAuthStatus !== 'connected'}
            className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 disabled:opacity-50"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Book with Calendly
          </Button>
          <Button 
            onClick={() => handleOpenModal()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowInstructions(!showInstructions)}
          >
            <Info className="h-4 w-4 mr-2" />
            Instructions
          </Button>
        </div>
      </div>

      {/* Instructions Panel */}
      {showInstructions && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <CheckCircle className="h-5 w-5 mr-2" />
              How to Use Your Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">🎉 Welcome to Your Calendar!</h4>
                <p>You can now manage all your appointments and meetings in one place. Here's how it works:</p>
              </div>
              
              <Separator className="bg-blue-300" />
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold mb-2">📅 Your Calendar View:</h5>
                  <ul className="space-y-1 text-sm">
                    <li>• See all your appointments in one calendar</li>
                    <li>• Events you create here stay in your system</li>
                    <li>• Events from your booking page appear automatically</li>
                    <li>• Click any event to see more details</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-semibold mb-2">➕ Creating & Managing Events:</h5>
                  <ul className="space-y-1 text-sm">
                    <li>• Click "Add Event" to create your own appointments</li>
                    <li>• You can edit events you create here</li>
                    <li>• Events from your booking page can't be edited here</li>
                    <li>• You can delete any event if needed</li>
                  </ul>
                </div>
              </div>
              
              <Separator className="bg-blue-300" />
              
              <div>
                <h5 className="font-semibold mb-2">🔄 Keeping Everything Updated:</h5>
                <ul className="space-y-1 text-sm">
                  <li>• Click "Sync Calendly" to get the latest bookings from your website</li>
                    <li>• Your own events are always safe and won't disappear</li>
                    <li>• Click "Book with Calendly" to let people schedule with you</li>
                    <li>• Check the "Upcoming Events" list to see what's next</li>
                </ul>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowInstructions(false)}
                className="mt-4"
              >
                Got it! Hide instructions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendly Connection Status */}
      {calendlyAuthStatus === 'connected' && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✅ Calendly connected successfully! You can now sync events and use the scheduling widget.
            {lastSyncTime && (
              <span className="block text-sm mt-1">
                Last synced: {lastSyncTime.toLocaleString()} 
                {syncStats.synced > 0 && ` (${syncStats.synced} new events)`}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {calendlyAuthStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ❌ Failed to connect Calendly. Please try again or check your configuration.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <CalendarIcon className="h-6 w-6" />
                    {getMonthName()}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changeMonth('prev')}
                    >
                      ←
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changeMonth('next')}
                    >
                      →
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-700 py-3 px-2 bg-gray-50 rounded">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {getCalendarDays().map((day, index) => {
                    if (!day) {
                      return <div key={index} className="min-h-[120px] p-2 border border-gray-200 bg-gray-50" />;
                    }
                    
                    const dateString = formatDate(day);
                    const dayEvents = events.filter(event => event.date === dateString);
                    const isToday = new Date().toDateString() === new Date(dateString).toDateString();
                    
                    return (
                      <div
                        key={day}
                        className={`min-h-[120px] p-2 border border-gray-200 ${
                          isToday ? 'bg-primary/10 border-primary' : ''
                        }`}
                      >
                        <div className="text-sm font-medium mb-2 text-gray-900">{day}</div>
                        <div className="space-y-1 max-h-[80px] overflow-y-auto">
                          {dayEvents.map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs p-1.5 rounded border-l-4 truncate ${
                                event.status === 'canceled' 
                                  ? 'border-gray-400 bg-gray-100 text-gray-500 line-through' 
                                  : `${getEventTypeColor(event.type)} bg-gray-50 cursor-pointer hover:bg-gray-100`
                              }`}
                              onClick={() => event.status !== 'canceled' && handleOpenModal(event)}
                              title={`${event.title} - ${event.time}${event.status === 'canceled' ? ' (Canceled)' : ''}`}
                            >
                              <div className="truncate flex items-center gap-1">
                                <span className="truncate">{event.title}</span>
                                {event.status === 'canceled' && <span className="text-xs text-gray-400 ml-1">(Canceled)</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming events</p>
                    <p className="text-sm">Click "Add Event" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`p-4 rounded-lg border-l-4 ${getEventTypeColor(event.type)} bg-gray-50`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{event.title}</h4>
                            {getEventSourceBadge(event)}
                          </div>
                          {event.status !== 'canceled' && (
                            <div className="flex gap-1">
                              {!event.calendlyUri && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenModal(event)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          {event.status === 'canceled' && (
                            <Badge variant="secondary" className="text-xs">
                              Canceled
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {event.time}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            {event.attendees} attendees
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Add Event'}</DialogTitle>
            <DialogDescription>
              {editingEvent ? 'Update your event details below.' : 'Create a new event by filling out the details below.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {formError && (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  className="col-span-3"
                  placeholder="Enter event title"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleFormChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startTime" className="text-right font-medium">
                  Start Time
                </Label>
                <div className="col-span-3">
                  <TimePicker
                    value={form.startTime}
                    onChange={(value) => handleTimeChange('startTime', value)}
                    placeholder="Select start time"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endTime" className="text-right font-medium">
                  End Time
                </Label>
                <div className="col-span-3">
                  <TimePicker
                    value={form.endTime}
                    onChange={(value) => handleTimeChange('endTime', value)}
                    placeholder="Select end time"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleFormChange}
                  className="col-span-3"
                  placeholder="Enter location"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="attendees" className="text-right">
                  Attendees
                </Label>
                <Input
                  id="attendees"
                  name="attendees"
                  type="number"
                  min="1"
                  value={form.attendees}
                  onChange={handleFormChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  value={form.type}
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingEvent ? 'Update Event' : 'Add Event'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Calendly Booking Modal */}
      <Dialog open={showCalendlyBooking} onOpenChange={setShowCalendlyBooking}>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] h-[90vh] max-h-[800px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Book with Calendly
            </DialogTitle>
            <DialogDescription>
              Schedule a meeting using your Calendly event type: {selectedEventType?.name || 'Loading...'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 min-h-0 relative">
            {selectedEventType && (
              <div className="h-full w-full">
                <iframe
                  src={`${selectedEventType.scheduling_url}?embed_domain=${encodeURIComponent(window.location.origin)}`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  title="Calendly Booking"
                  className="rounded-md"
                  style={{ minHeight: '600px' }}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeCalendlyBooking}>
              Close
            </Button>
            <Button 
              type="button" 
              onClick={() => {
                closeCalendlyBooking();
                // Refresh events after booking
                setTimeout(() => {
                  loadEvents();
                  syncCalendlyEvents();
                }, 2000);
              }}
            >
              Done & Refresh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 