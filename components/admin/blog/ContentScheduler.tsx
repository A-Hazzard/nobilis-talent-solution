'use client';


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Clock, 
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface ContentSchedulerProps {
  scheduledDate: string;
  scheduledTime: string;
  isScheduled: boolean;
  onScheduleChange: (date: string, time: string, isScheduled: boolean) => void;
}

export function ContentScheduler({ 
  scheduledDate, 
  scheduledTime, 
  isScheduled, 
  onScheduleChange 
}: ContentSchedulerProps) {

  const handleDateChange = (date: string) => {
    onScheduleChange(date, scheduledTime, isScheduled);
  };

  const handleTimeChange = (time: string) => {
    onScheduleChange(scheduledDate, time, isScheduled);
  };

  const handleScheduleToggle = (enabled: boolean) => {
    onScheduleChange(scheduledDate, scheduledTime, enabled);
  };

  const getScheduledDateTime = () => {
    if (!isScheduled || !scheduledDate || !scheduledTime) return null;
    return new Date(`${scheduledDate}T${scheduledTime}`);
  };

  const getTimeUntilPublish = () => {
    const scheduledDateTime = getScheduledDateTime();
    if (!scheduledDateTime) return null;

    const now = new Date();
    const diff = scheduledDateTime.getTime() - now.getTime();

    if (diff <= 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isOverdue = () => {
    const scheduledDateTime = getScheduledDateTime();
    return scheduledDateTime && scheduledDateTime < new Date();
  };

  const getStatusBadge = () => {
    if (!isScheduled) {
      return <Badge variant="outline">Not Scheduled</Badge>;
    }
    
    if (isOverdue()) {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    }
    
    return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Content Scheduling
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Schedule Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Schedule for later</Label>
            <p className="text-xs text-gray-600">
              Set a specific date and time to publish this content
            </p>
          </div>
          <Switch
            checked={isScheduled}
            onCheckedChange={handleScheduleToggle}
          />
        </div>

        {isScheduled && (
          <>
            {/* Date and Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduleDate">Date</Label>
                <Input
                  id="scheduleDate"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduleTime">Time</Label>
                <Input
                  id="scheduleTime"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                />
              </div>
            </div>

            {/* Status Display */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Publish Date</span>
              </div>
              <div className="flex items-center gap-2">
                {getScheduledDateTime() && (
                  <span className="text-sm text-gray-600">
                    {getScheduledDateTime()?.toLocaleDateString()} at{' '}
                    {getScheduledDateTime()?.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                )}
                {getStatusBadge()}
              </div>
            </div>

            {/* Time Until Publish */}
            {getTimeUntilPublish() && (
              <Alert variant={isOverdue() ? 'destructive' : 'default'}>
                {isOverdue() ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                <AlertDescription>
                  {isOverdue() ? (
                    'This content is overdue for publication'
                  ) : (
                    `Will publish in ${getTimeUntilPublish()}`
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Quick Schedule Options */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Schedule</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(9, 0, 0, 0);
                    onScheduleChange(
                      tomorrow.toISOString().split('T')[0],
                      '09:00',
                      true
                    );
                  }}
                >
                  Tomorrow 9 AM
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const nextWeek = new Date();
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    nextWeek.setHours(10, 0, 0, 0);
                    onScheduleChange(
                      nextWeek.toISOString().split('T')[0],
                      '10:00',
                      true
                    );
                  }}
                >
                  Next Week
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const nextMonth = new Date();
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    nextMonth.setHours(14, 0, 0, 0);
                    onScheduleChange(
                      nextMonth.toISOString().split('T')[0],
                      '14:00',
                      true
                    );
                  }}
                >
                  Next Month
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Publishing Tips */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Publishing Tips
          </h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Best times to publish: Tuesday-Thursday, 9 AM - 2 PM</li>
            <li>• Consider your audience's timezone</li>
            <li>• Avoid publishing on weekends for business content</li>
            <li>• Schedule multiple posts in advance for consistency</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 