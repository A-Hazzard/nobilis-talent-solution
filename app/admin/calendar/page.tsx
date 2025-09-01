'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, CalendarIcon } from 'lucide-react';
import { useCalendar } from '@/lib/hooks/useCalendar';
import { CalendlyService } from '@/lib/services/CalendlyService';
import CalendarHeader from '@/components/admin/calendar/CalendarHeader';
import CalendarGrid from '@/components/admin/calendar/CalendarGrid';
import UpcomingEvents from '@/components/admin/calendar/UpcomingEvents';
import EventForm from '@/components/admin/calendar/EventForm';

// Force dynamic rendering to prevent pre-rendering issues
export const dynamic = 'force-dynamic';

/**
 * Calendar page component for managing events and Calendly integration
 * Uses custom hook for state management and focused components for UI
 */
export default function CalendarPage() {
  const searchParams = useSearchParams();
  const calendlyService = CalendlyService.getInstance();
  const [isClient, setIsClient] = useState(false);
  
  const [state, actions] = useCalendar();
  const {
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
  } = state;

  const {
    syncCalendlyEvents,
    connectCalendly,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDeleteEvent,
    handleFormChange,
    handleTypeChange,
    handleTimeChange,
    handleDateChange,
    changeMonth,
    setMonth,
    openCalendlyBooking,
    toggleInstructions,
    checkCalendlyConnection,
  } = actions;

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    if (!isClient) return; // Don't run on server side
    
    const success = searchParams.get('success');
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (success && token) {
      console.log('🎉 OAuth callback successful, setting up Calendly connection...');
      // Store the token and update connection status
      localStorage.setItem('calendly_access_token', token);
      calendlyService.setAccessToken(token);
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Update connection status and sync events
      checkCalendlyConnection().then((connectionStatus) => {
        if (connectionStatus === 'connected') {
          console.log('🔄 Auto-syncing Calendly events after OAuth callback...');
          // Auto-sync after successful connection
          syncCalendlyEvents();
        }
      });
    } else if (error) {
      console.error('Calendly OAuth error:', error);
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams, calendlyService, syncCalendlyEvents, checkCalendlyConnection, isClient]);

  // Don't render anything until we're on the client side
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <CalendarIcon className="h-12 w-12 mx-auto mb-4 animate-spin" />
          <p>Initializing calendar...</p>
        </div>
      </div>
    );
  }

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
      <CalendarHeader
        calendlyAuthStatus={calendlyAuthStatus}
        syncStatus={syncStatus}
        onSyncCalendly={syncCalendlyEvents}
        onOpenCalendlyBooking={openCalendlyBooking}
        onAddEvent={() => handleOpenModal()}
        onToggleInstructions={toggleInstructions}
      />

      {/* Temporary debug button for testing Calendly connection */}
      {calendlyAuthStatus === 'disconnected' && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-sm sm:text-base">Calendly not connected. Click to connect manually:</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={connectCalendly}
                className="w-full sm:w-auto"
              >
                Connect Calendly
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

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
                    <li>• Events from your Calendy appear automatically</li>
                    <li>• Click any event to see more details</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-semibold mb-2">➕ Creating & Managing Events:</h5>
                  <ul className="space-y-1 text-sm">
                    <li>• Click "Add Event" to create your own appointments</li>
                    <li>• You can edit events you create here</li>
                    <li>• Events from your Calendy can't be edited here</li>
                    <li>• You can delete any event if needed</li>
                  </ul>
                </div>
              </div>
              
              <Separator className="bg-blue-300" />
              
              <div>
                <h5 className="font-semibold mb-2">🔄 Keeping Everything Updated:</h5>
                <ul className="space-y-1 text-sm">
                  <li>• Calendly connects automatically when you load this page</li>
                  <li>• Click "Sync Calendly" to get the latest bookings from your website</li>
                  <li>• Your own events are always safe and won't disappear</li>
                  <li>• Click "Book with Calendly" to let people schedule with you</li>
                  <li>• Check the "Upcoming Events" list to see what's next</li>
                </ul>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleInstructions}
                className="mt-4"
              >
                Got it! Hide instructions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {calendlyAuthStatus === 'connected' && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-sm sm:text-base">✅ Connected to Calendly</span>
              {lastSyncTime && (
                <span className="text-sm">
                  Last synced: {lastSyncTime.toLocaleTimeString()}
                </span>
              )}
            </div>
            {syncStats.total > 0 && (
              <div className="text-sm mt-1">
                {syncStats.synced} Calendly events synced ({syncStats.total} total events)
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {calendlyAuthStatus === 'error' && connectionAttempts >= maxConnectionAttempts && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to connect to Calendly after {maxConnectionAttempts} attempts. 
            The system will continue trying to connect automatically.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <CalendarGrid
            events={events}
            currentMonth={currentMonth}
            onEventClick={handleOpenModal}
            onMonthChange={changeMonth}
            onMonthSet={setMonth}
          />
        </div>
        <div className="lg:col-span-1">
          <UpcomingEvents
            events={events}
            onEventEdit={handleOpenModal}
            onEventDelete={handleDeleteEvent}
          />
        </div>
      </div>

      <EventForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        form={form}
        formError={formError}
        editingEvent={editingEvent}
        onSubmit={handleSubmit}
        onFormChange={handleFormChange}
        onTypeChange={handleTypeChange}
        onTimeChange={handleTimeChange}
        onDateChange={handleDateChange}
      />
    </div>
  );
} 