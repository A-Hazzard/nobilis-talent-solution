'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Clock, MapPin, Users, Edit, Trash2 } from 'lucide-react';
import type { CalendarEvent } from '@/shared/types/entities';
import { CalendarUtils } from '@/lib/utils/calendarUtils';

interface UpcomingEventsProps {
  events: CalendarEvent[];
  onEventEdit: (event: CalendarEvent) => void;
  onEventDelete: (eventId: string) => void;
}

/**
 * Upcoming events sidebar component displaying next 5 events
 */
export default function UpcomingEvents({
  events,
  onEventEdit,
  onEventDelete,
}: UpcomingEventsProps) {
  const upcomingEvents = CalendarUtils.getUpcomingEvents(events, 5);

  const getEventSourceBadge = (event: CalendarEvent) => {
    if (event.calendlyUri) {
      return <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Calendly</Badge>;
    } else {
      return <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Local</Badge>;
    }
  };

  const getEventTypeColor = (type: string) => {
    return CalendarUtils.getEventTypeColor(type);
  };

  return (
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
                <div className="flex items-start justify-between mb-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>
                    {getEventSourceBadge(event)}
                  </div>
                  {event.status !== 'canceled' && (
                    <div className="flex gap-1 flex-shrink-0 ml-2">
                      {!event.calendlyUri && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEventEdit(event)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEventDelete(event.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {event.status === 'canceled' && (
                    <Badge variant="secondary" className="text-xs flex-shrink-0 ml-2">
                      Canceled
                    </Badge>
                  )}
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 flex-shrink-0" />
                    <span>{event.attendees} attendees</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 