'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw, CalendarIcon, Plus, Info } from 'lucide-react';

interface CalendarHeaderProps {
  calendlyAuthStatus: 'connected' | 'disconnected' | 'error' | 'connecting';
  syncStatus: 'disconnected' | 'syncing' | 'success' | 'error';
  onSyncCalendly: () => void;
  onOpenCalendlyBooking: () => void;
  onAddEvent: () => void;
  onToggleInstructions: () => void;
}

/**
 * Header component for calendar page with Calendly integration and action buttons
 */
export default function CalendarHeader({
  calendlyAuthStatus,
  syncStatus,
  onSyncCalendly,
  onOpenCalendlyBooking,
  onAddEvent,
  onToggleInstructions,
}: CalendarHeaderProps) {
  return (
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
            onClick={onSyncCalendly}
            disabled={syncStatus === 'syncing'}
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Calendly'}
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={onOpenCalendlyBooking}
          disabled={calendlyAuthStatus !== 'connected'}
          className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 disabled:opacity-50"
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          Book with Calendly
        </Button>
        
        <Button 
          onClick={onAddEvent}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onToggleInstructions}
        >
          <Info className="h-4 w-4 mr-2" />
          Instructions
        </Button>
      </div>
    </div>
  );
} 