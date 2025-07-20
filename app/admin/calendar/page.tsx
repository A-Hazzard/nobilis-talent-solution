'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Plus, Clock, MapPin, Users, Trash2, Edit, RefreshCw, Link, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import type { CalendarEvent } from '@/shared/types/entities';
import { CalendarService } from '@/lib/services/CalendarService';
import { CalendlyService } from '@/lib/services/CalendlyService';
import { useUserStore } from '@/lib/stores/userStore';
import CalendlyWidget from '@/components/admin/CalendlyWidget';

type EventFormData = {
  title: string;
  date: string;
  time: string;
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
    time: '',
    location: '',
    attendees: 1,
    type: 'workshop',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar');
  const [calendlyAuthStatus, setCalendlyAuthStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [showInstructions, setShowInstructions] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStats, setSyncStats] = useState<{ synced: number; total: number }>({ synced: 0, total: 0 });
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [showCalendlyBooking, setShowCalendlyBooking] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<any>(null);

  const { user } = useUserStore();
  const calendarService = CalendarService.getInstance();
  const calendlyService = CalendlyService.getInstance();

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
      // Show success message and instructions
      setShowInstructions(true);
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
      const response = await calendarService.getEvents();
      
      if (response.error) {
        console.error('Error loading events:', response.error);
        return;
      }
      
      setEvents(response.data || []);
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

  const syncCalendlyEvents = async () => {
    try {
      setIsSyncing(true);
      const { data: calendlyEvents, error } = await calendlyService.syncCalendlyEvents();
      
      if (error) {
        console.error('Error syncing Calendly events:', error);
        if (error.includes('Not authenticated')) {
          setCalendlyAuthStatus('disconnected');
        }
        return;
      }

      // Merge Calendly events with existing events
      const existingEventIds = new Set(events.map(e => e.id));
      const newCalendlyEvents = calendlyEvents.filter(e => !existingEventIds.has(e.id));
      
      if (newCalendlyEvents.length > 0) {
        // Save new Calendly events to database
        for (const event of newCalendlyEvents) {
          await calendarService.createEvent(event);
        }
        
        // Reload all events
        await loadEvents();
        
        // Update sync stats
        setSyncStats({ synced: newCalendlyEvents.length, total: calendlyEvents.length });
        setLastSyncTime(new Date());
      } else {
        setSyncStats({ synced: 0, total: calendlyEvents.length });
        setLastSyncTime(new Date());
      }
    } catch (error) {
      console.error('Error syncing Calendly events:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCalendlyEventScheduled = async (eventDetails: any) => {
    console.log('Calendly event scheduled:', eventDetails);
    // Optionally sync events immediately when a new one is scheduled
    await syncCalendlyEvents();
  };

  const debugCalendlyConnection = async () => {
    try {
      setShowDebug(true);
      const debugData: any = {};

      // Test user info
      const userInfo = await calendlyService.getUserInfo();
      debugData.userInfo = userInfo;
      console.log('👤 User info:', userInfo);

      // Test event types
      const eventTypes = await calendlyService.getEventTypes();
      debugData.eventTypes = eventTypes;
      console.log('📋 Event types:', eventTypes);

      // Test raw events
      const rawEvents = await calendlyService.getScheduledEvents();
      debugData.rawEvents = rawEvents;
      console.log('📅 Raw events:', rawEvents);

      // Test different event fetching approaches
      const eventTests = await calendlyService.testEventFetching();
      debugData.eventTests = eventTests;
      console.log('🧪 Event tests:', eventTests);

      // Test sync
      const syncResult = await calendlyService.syncCalendlyEvents();
      debugData.syncResult = syncResult;
      console.log('🔄 Sync result:', syncResult);

      setDebugInfo(debugData);
    } catch (error) {
      console.error('Debug error:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const resetForm = () => {
    setForm({ title: '', date: '', time: '', location: '', attendees: 1, type: 'workshop' });
    setFormError(null);
    setEditingEvent(null);
  };

  const handleOpenModal = (event?: CalendarEvent) => {
    if (event) {
      setEditingEvent(event);
      setForm({
        title: event.title,
        date: event.date,
        time: event.time,
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
    setForm((prev) => ({ ...prev, [name]: name === 'attendees' ? Number(value) : value }));
    setFormError(null);
  };

  const handleTypeChange = (value: string) => {
    setForm((prev) => ({ ...prev, type: value as CalendarEvent['type'] }));
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setFormError('User not authenticated');
      return;
    }

    try {
      if (editingEvent) {
        // Update existing event
        const response = await calendarService.updateEvent({
          id: editingEvent.id,
          ...form,
          createdBy: user.id,
        });
        
        if (response.error) {
          setFormError(response.error.message);
          return;
        }
      } else {
        // Create new event
        const response = await calendarService.createEvent({
          ...form,
          createdBy: user.id,
        });
        
        if (response.error) {
          setFormError(response.error.message);
          return;
        }
      }
      
      // Reload events and close modal
      await loadEvents();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving event:', error);
      setFormError('Failed to save event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const response = await calendarService.deleteEvent(eventId);
      
      if (response.error) {
        console.error('Error deleting event:', response.error);
        return;
      }
      
      await loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleQuickAction = (type: CalendarEvent['type']) => {
    const today = new Date().toISOString().split('T')[0];
    setForm({
      title: '',
      date: today,
      time: '',
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

  // Sort events by date for upcoming events
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Manage your appointments and events</p>
        </div>
        <div className="flex gap-2">
          {calendlyAuthStatus === 'connected' ? (
            <Button 
              variant="outline" 
              onClick={syncCalendlyEvents}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Calendly'}
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={connectCalendly}
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              <Link className="h-4 w-4 mr-2" />
              Connect Calendly
            </Button>
          )}
          <div className="flex gap-2">
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Event
            </Button>
            {calendlyAuthStatus === 'connected' && (
              <Button 
                variant="outline" 
                onClick={openCalendlyBooking}
                className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Book with Calendly
              </Button>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowInstructions(!showInstructions)}
          >
            <Info className="h-4 w-4 mr-2" />
            Instructions
          </Button>
          <Button 
            variant="outline" 
            onClick={debugCalendlyConnection}
            className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
          >
            🐛 Debug
          </Button>
        </div>
      </div>

      {/* Instructions Panel */}
      {showInstructions && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <CheckCircle className="h-5 w-5 mr-2" />
              Calendly Integration Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">🎉 Welcome to Your Integrated Calendar!</h4>
                <p>Your Calendly account is now connected. Here's how to use the integrated system:</p>
              </div>
              
              <Separator className="bg-blue-300" />
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold mb-2">📅 Calendar View Tab:</h5>
                  <ul className="space-y-1 text-sm">
                    <li>• View all your events in one place</li>
                    <li>• Events from Calendly appear with a special badge</li>
                    <li>• Add custom events directly to your calendar</li>
                    <li>• Edit or delete any event</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-semibold mb-2">📋 Schedule Meeting Tab:</h5>
                  <ul className="space-y-1 text-sm">
                    <li>• Embed Calendly scheduling widget</li>
                    <li>• Let clients book meetings directly</li>
                    <li>• Automatic sync when meetings are scheduled</li>
                    <li>• Real-time availability updates</li>
                  </ul>
                </div>
              </div>
              
              <Separator className="bg-blue-300" />
              
              <div>
                <h5 className="font-semibold mb-2">🔄 Sync Process:</h5>
                <ul className="space-y-1 text-sm">
                  <li>• Click "Sync Calendly" to fetch new events</li>
                  <li>• New Calendly events automatically appear in your calendar</li>
                  <li>• Custom events remain separate from Calendly events</li>
                  <li>• All events are stored in your database for easy management</li>
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

      {/* Debug Panel */}
      {showDebug && debugInfo && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              🐛 Debug Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-700">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">🔍 Calendly API Debug Results:</h4>
                <pre className="bg-white p-4 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDebug(false)}
                className="mt-4"
              >
                Hide Debug Info
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="scheduling">Schedule Meeting</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
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
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {getCalendarDays().map((day, index) => {
                  if (!day) {
                    return <div key={index} className="min-h-[80px] p-2 border border-gray-200 bg-gray-50" />;
                  }
                  
                  const dateString = formatDate(day);
                  const dayEvents = events.filter(event => event.date === dateString);
                  const isToday = new Date().toDateString() === new Date(dateString).toDateString();
                  
                  return (
                    <div
                      key={day}
                      className={`min-h-[80px] p-2 border border-gray-200 ${
                        isToday ? 'bg-primary/10 border-primary' : ''
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">{day}</div>
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 mb-1 rounded border-l-4 ${getEventTypeColor(event.type)} bg-gray-50 cursor-pointer hover:bg-gray-100`}
                          onClick={() => handleOpenModal(event)}
                          title={`${event.title} - ${event.time}`}
                        >
                          {event.title}
                        </div>
                      ))}
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
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(event)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
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

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('consultation')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Consultation
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('workshop')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Book Workshop
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('training')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Plan Training Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-6">
          {calendlyAuthStatus === 'connected' ? (
            <CalendlyWidget 
              calendlyUrl="https://calendly.com/your-calendly-link"
              onEventScheduled={handleCalendlyEventScheduled}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Connect Calendly</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <Link className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Connect Your Calendly Account</h3>
                <p className="text-gray-600 mb-6">
                  To use the scheduling widget and sync events, you need to connect your Calendly account first.
                </p>
                <Button onClick={connectCalendly} size="lg">
                  <Link className="h-4 w-4 mr-2" />
                  Connect Calendly
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Add Event'}</DialogTitle>
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
                <Label htmlFor="time" className="text-right">
                  Time
                </Label>
                <Input
                  id="time"
                  name="time"
                  value={form.time}
                  onChange={handleFormChange}
                  className="col-span-3"
                  placeholder="e.g., 10:00 AM - 12:00 PM"
                />
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
        <DialogContent className="sm:max-w-[600px] h-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Book with Calendly
            </DialogTitle>
            <DialogDescription>
              Schedule a meeting using your Calendly event type: {selectedEventType?.name || 'Loading...'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 min-h-0">
            {selectedEventType && (
              <div className="h-full">
                <iframe
                  src={`${selectedEventType.scheduling_url}?embed_domain=${encodeURIComponent(window.location.origin)}`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  title="Calendly Booking"
                  className="rounded-md"
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