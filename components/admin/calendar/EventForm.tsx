import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/shared/types/entities';
import type { EventFormData } from '@/lib/hooks/useCalendar';

interface EventFormProps {
  isOpen: boolean;
  editingEvent: CalendarEvent | null;
  form: EventFormData;
  formError: string | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTypeChange: (value: string) => void;
  onTimeChange: (field: 'startTime' | 'endTime', value: string) => void;
}

interface TimeOption {
  value: string;
  display: string;
}

/**
 * Event form modal component for creating and editing events
 */
export default function EventForm({
  isOpen,
  editingEvent,
  form,
  formError,
  onClose,
  onSubmit,
  onFormChange,
  onTypeChange,
  onTimeChange,
}: EventFormProps) {
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);

  const timeOptions: TimeOption[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      timeOptions.push({ value: time, display: displayTime });
    }
  }

  const TimePicker = ({ 
    value, 
    onChange, 
    placeholder,
    isOpen,
    setIsOpen
  }: { 
    value: string; 
    onChange: (value: string) => void; 
    placeholder: string;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
  }) => {
    const displayValue = value ? new Date(`2000-01-01T${value}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) : placeholder;

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-10 px-3 py-2",
              !value && "text-muted-foreground"
            )}
          >
            <Clock className="mr-2 h-4 w-4 text-gray-500" />
            {displayValue}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-0" align="start">
          <div className="max-h-60 overflow-y-auto">
            {timeOptions.map((option) => (
              <Button
                key={option.value}
                variant={option.value === value ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-9 px-3",
                  option.value === value && "bg-primary text-primary-foreground"
                )}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.display}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingEvent ? 'Edit Event' : 'Add Event'}</DialogTitle>
          <DialogDescription>
            {editingEvent ? 'Update your event details below.' : 'Create a new event by filling out the details below.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={onFormChange}
                className="col-span-3"
                placeholder="Enter event title"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={onFormChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right font-medium">
                Start Time
              </Label>
              <div className="col-span-3">
                <TimePicker
                  value={form.startTime}
                  onChange={(value) => onTimeChange('startTime', value)}
                  placeholder="Select start time"
                  isOpen={isStartTimeOpen}
                  setIsOpen={setIsStartTimeOpen}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right font-medium">
                End Time
              </Label>
              <div className="col-span-3">
                <TimePicker
                  value={form.endTime}
                  onChange={(value) => onTimeChange('endTime', value)}
                  placeholder="Select end time"
                  isOpen={isEndTimeOpen}
                  setIsOpen={setIsEndTimeOpen}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                name="location"
                value={form.location}
                onChange={onFormChange}
                className="col-span-3"
                placeholder="Enter location"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="attendees" className="text-right">
                Attendees
              </Label>
              <Input
                id="attendees"
                name="attendees"
                type="number"
                min="1"
                value={form.attendees}
                onChange={onFormChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={form.type}
                onValueChange={onTypeChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingEvent ? 'Update Event' : 'Add Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 