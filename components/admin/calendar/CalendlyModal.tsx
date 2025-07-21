'use client';

import { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Settings, X } from 'lucide-react';

interface CalendlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventType: any;
  onEventScheduled?: (eventDetails: any) => void;
}

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: any) => void;
    };
  }
}

/**
 * Modal component for Calendly booking widget
 * Displays Calendly booking interface in a modal dialog
 */
export default function CalendlyModal({ 
  isOpen, 
  onClose, 
  eventType, 
  onEventScheduled 
}: CalendlyModalProps) {
  const calendlyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !eventType) return;

    // Load Calendly script if not already loaded
    if (!window.Calendly) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.head.appendChild(script);
    }

    // Initialize widget when script is loaded
    const initWidget = () => {
      if (window.Calendly && calendlyRef.current && eventType) {
        window.Calendly.initInlineWidget({
          url: eventType.booking_url || eventType.uri,
          parentElement: calendlyRef.current,
          prefill: {},
          utm: {},
          hideEventTypeDetails: false,
          hideLandingPageDetails: false,
        });
      }
    };

    // Wait for script to load
    if (window.Calendly) {
      initWidget();
    } else {
      const checkCalendly = setInterval(() => {
        if (window.Calendly) {
          initWidget();
          clearInterval(checkCalendly);
        }
      }, 100);
    }

    // Listen for Calendly events
    const handleCalendlyEvent = (e: any) => {
      if (e.data.event && e.data.event.indexOf('calendly.event_scheduled') === 0) {
        const eventDetails = e.data.payload;
        if (onEventScheduled) {
          onEventScheduled(eventDetails);
        }
        onClose();
      }
    };

    window.addEventListener('message', handleCalendlyEvent);

    return () => {
      window.removeEventListener('message', handleCalendlyEvent);
    };
  }, [isOpen, eventType, onEventScheduled, onClose]);

  if (!eventType) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Schedule: {eventType.name || 'Meeting'}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(eventType.booking_url || eventType.uri, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Calendly
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://calendly.com/app/admin/integrations', '_blank')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <div 
            ref={calendlyRef}
            className="w-full h-[600px]"
            style={{ minHeight: '600px' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 