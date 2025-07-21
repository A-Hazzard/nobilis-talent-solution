'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, CalendarIcon } from 'lucide-react';
import { useCalendar } from '@/lib/hooks/useCalendar';
import { useUserStore } from '@/lib/stores/userStore';
import { CalendlyService } from '@/lib/services/CalendlyService';
import CalendarHeader from '@/components/admin/calendar/CalendarHeader';
import CalendarGrid from '@/components/admin/calendar/CalendarGrid';
import UpcomingEvents from '@/components/admin/calendar/UpcomingEvents';
import EventForm from '@/components/admin/calendar/EventForm';
import CalendlyWidget from '@/components/admin/CalendlyWidget';

/**
 * Calendar page component for managing events and Calendly integration
 * Uses custom hook for state management and focused components for UI
 */
export default function CalendarPage() {
  const searchParams = useSearchParams();
  const { user } = useUserStore();
  const calendlyService = CalendlyService.getInstance();
  
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
    showCalendlyBooking,
    selectedEventType,
  } = state;

  const {
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
  } = actions;

  // Auto-connect to Calendly on page load
  useEffect(() => {
    const autoConnectCalendly = async () => {
      try {
        const storedToken = localStorage.getItem('calendly_access_token');
        if (storedToken) {
          calendlyService.setAccessToken(storedToken);
          
          const userInfo = await calendlyService.getUserInfo();
          if (userInfo.data) {
            // Auto-sync events once connected
            await syncCalendlyEvents();
            return;
          } else {
            localStorage.removeItem('calendly_access_token');
          }
        }
        
        // If no valid token, try to connect automatically
        const authUrl = calendlyService.getAuthorizationUrl();
        window.location.href = authUrl;
        
      } catch (error) {
        console.error('Auto-connection failed:', error);
      }
    };

    if (calendlyAuthStatus === 'connecting' && !searchParams.get('success') && !searchParams.get('error')) {
      autoConnectCalendly();
    }
  }, [calendlyAuthStatus, calendlyService, searchParams, syncCalendlyEvents]);

  // Handle OAuth callback
  useEffect(() => {
    const success = searchParams.get('success');
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (success && token) {
      calendlyService.setAccessToken(token);
      window.history.replaceState({}, document.title, window.location.pathname);
      syncCalendlyEvents();
    } else if (error) {
      console.error('Calendly OAuth error:', error);
    }
  }, [searchParams, calendlyService, syncCalendlyEvents]);

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
        onConnectCalendly={connectCalendly}
        onOpenCalendlyBooking={openCalendlyBooking}
        onAddEvent={() => handleOpenModal()}
        onToggleInstructions={toggleInstructions}
      />

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
          <div className="lg:col-span-2">
            <CalendarGrid
              currentMonth={currentMonth}
              events={events}
              onMonthChange={changeMonth}
              onEventClick={handleOpenModal}
            />
          </div>

          <div className="space-y-6">
            <UpcomingEvents
              events={events}
              onEventEdit={handleOpenModal}
              onEventDelete={handleDeleteEvent}
            />
          </div>
        </div>
      </div>

      <EventForm
        isOpen={isModalOpen}
        editingEvent={editingEvent}
        form={form}
        formError={formError}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        onFormChange={handleFormChange}
        onTypeChange={handleTypeChange}
        onTimeChange={handleTimeChange}
      />

      <Dialog open={showCalendlyBooking} onOpenChange={closeCalendlyBooking}>
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