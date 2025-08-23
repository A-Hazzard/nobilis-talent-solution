'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import type { CalendarEvent } from '@/shared/types/entities';
import { CalendarUtils } from '@/lib/utils/calendarUtils';

interface CalendarGridProps {
  currentMonth: Date;
  events: CalendarEvent[];
  onMonthChange: (direction: 'prev' | 'next') => void;
  onEventClick: (event: CalendarEvent) => void;
}

/**
 * Calendar grid component displaying monthly view with events
 */
export default function CalendarGrid({
  currentMonth,
  events,
  onMonthChange,
  onEventClick,
}: CalendarGridProps) {
  const calendarDays = CalendarUtils.getCalendarDays(currentMonth);
  const monthName = CalendarUtils.getMonthName(currentMonth);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl">
            <CalendarIcon className="h-6 w-6" />
            {monthName}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMonthChange('prev')}
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMonthChange('next')}
            >
              →
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs sm:text-sm font-semibold text-gray-700 py-2 sm:py-3 px-1 sm:px-2 bg-gray-50 rounded">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 border border-gray-200 bg-gray-50" />;
            }
            
            const dateString = CalendarUtils.formatDate(day, currentMonth);
            const dayEvents = events.filter(event => event.date === dateString);
            const isToday = CalendarUtils.isToday(dateString);
            
            return (
              <div
                key={`day-${dateString}`}
                className={`min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 border border-gray-200 ${
                  isToday ? 'bg-primary/10 border-primary' : ''
                }`}
              >
                <div className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-900">{day}</div>
                <div className="space-y-0.5 sm:space-y-1 max-h-[60px] sm:max-h-[80px] overflow-y-auto">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 sm:p-1.5 rounded border-l-2 sm:border-l-4 truncate ${
                        event.status === 'canceled' 
                          ? 'border-gray-400 bg-gray-100 text-gray-500 line-through' 
                          : `${CalendarUtils.getEventTypeColor(event.type)} bg-gray-50 cursor-pointer hover:bg-gray-100`
                      }`}
                      onClick={() => event.status !== 'canceled' && onEventClick(event)}
                      title={`${event.title} - ${event.time}${event.status === 'canceled' ? ' (Canceled)' : ''}`}
                    >
                      <div className="truncate flex items-center gap-1">
                        <span className="truncate text-xs">{event.title}</span>
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
  );
} 