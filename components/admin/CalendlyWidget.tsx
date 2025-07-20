'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Settings } from 'lucide-react';

interface CalendlyWidgetProps {
  calendlyUrl: string;
  onEventScheduled?: (eventDetails: any) => void;
  className?: string;
}

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: any) => void;
    };
  }
}

export default function CalendlyWidget({ 
  calendlyUrl, 
  onEventScheduled, 
  className = "" 
}: CalendlyWidgetProps) {
  const calendlyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Calendly script if not already loaded
    if (!window.Calendly) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.head.appendChild(script);
    }

    // Initialize widget when script is loaded
    const initWidget = () => {
      if (window.Calendly && calendlyRef.current) {
        window.Calendly.initInlineWidget({
          url: calendlyUrl,
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
      }
    };

    window.addEventListener('message', handleCalendlyEvent);

    return () => {
      window.removeEventListener('message', handleCalendlyEvent);
    };
  }, [calendlyUrl, onEventScheduled]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Schedule a Meeting</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(calendlyUrl, '_blank')}
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
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={calendlyRef}
          className="min-h-[600px] w-full"
          style={{ minHeight: '600px' }}
        />
      </CardContent>
    </Card>
  );
} 