'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Plus, Clock, MapPin, Users } from 'lucide-react';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock calendar events
  const events = [
    {
      id: 1,
      title: 'Leadership Workshop',
      date: '2024-01-15',
      time: '10:00 AM - 12:00 PM',
      location: 'Conference Room A',
      attendees: 12,
      type: 'workshop',
    },
    {
      id: 2,
      title: 'Client Consultation - John Smith',
      date: '2024-01-16',
      time: '2:00 PM - 3:00 PM',
      location: 'Virtual Meeting',
      attendees: 2,
      type: 'consultation',
    },
    {
      id: 3,
      title: 'Team Building Session',
      date: '2024-01-17',
      time: '9:00 AM - 11:00 AM',
      location: 'Training Center',
      attendees: 8,
      type: 'training',
    },
    {
      id: 4,
      title: 'Strategy Planning Meeting',
      date: '2024-01-18',
      time: '1:00 PM - 4:00 PM',
      location: 'Board Room',
      attendees: 6,
      type: 'meeting',
    },
  ];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Manage your appointments and events</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                January 2024
              </CardTitle>
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
                {Array.from({ length: 31 }, (_, i) => {
                  const date = i + 1;
                  const dateString = `2024-01-${date.toString().padStart(2, '0')}`;
                  const dayEvents = events.filter(event => event.date === dateString);
                  
                  return (
                    <div
                      key={date}
                      className={`min-h-[80px] p-2 border border-gray-200 ${
                        date === selectedDate.getDate() ? 'bg-primary/10 border-primary' : ''
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">{date}</div>
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 mb-1 rounded border-l-4 ${getEventTypeColor(event.type)} bg-gray-50`}
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
              <div className="space-y-4">
                {events.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border-l-4 ${getEventTypeColor(event.type)} bg-gray-50`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      {getEventTypeBadge(event.type)}
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
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Consultation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Book Workshop
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Plan Training Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 