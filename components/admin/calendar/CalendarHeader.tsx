import { Button } from '@/components/ui/button';
import { RefreshCw, Link, CalendarIcon, Plus, Info } from 'lucide-react';

interface CalendarHeaderProps {
  calendlyAuthStatus: 'connected' | 'disconnected' | 'error' | 'connecting';
  syncStatus: 'disconnected' | 'syncing' | 'success' | 'error';
  onSyncCalendly: () => void;
  onConnectCalendly: () => void;
  onOpenCalendlyBooking: () => void;
  onAddEvent: () => void;
  onToggleInstructions: () => void;
  connectionAttempts: number;
  maxConnectionAttempts: number;
}

/**
 * Header component for calendar page with Calendly integration and action buttons
 */
export default function CalendarHeader({
  calendlyAuthStatus,
  syncStatus,
  onSyncCalendly,
  onConnectCalendly,
  onOpenCalendlyBooking,
  onAddEvent,
  onToggleInstructions,
  connectionAttempts,
  maxConnectionAttempts,
}: CalendarHeaderProps) {
  // Show connect button only after max attempts or if disconnected
  const shouldShowConnectButton = calendlyAuthStatus === 'disconnected' || 
    (calendlyAuthStatus === 'error' && connectionAttempts >= maxConnectionAttempts);

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
        
        {shouldShowConnectButton && (
          <Button 
            variant="outline" 
            onClick={onConnectCalendly}
            className={`${
              calendlyAuthStatus === 'error' 
                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' 
                : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
            }`}
          >
            <Link className="h-4 w-4 mr-2" />
            {calendlyAuthStatus === 'error' ? 'Retry Connection' : 'Connect Calendly'}
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