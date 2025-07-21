import type { CalendarEvent } from '@/shared/types/entities';

/**
 * Utility class for calendar-related operations
 * Handles date formatting, time parsing, and calendar calculations
 */
export class CalendarUtils {
  /**
   * Parse Calendly time format into start and end times
   * @param timeString - Time string in format "10:00:00 am - 10:30:00 am"
   * @returns Object with startTime and endTime in 24-hour format
   */
  static parseCalendlyTime(timeString: string): { startTime: string; endTime: string } {
    if (!timeString) return { startTime: '', endTime: '' };
    
    const parts = timeString.split(' - ');
    if (parts.length !== 2) return { startTime: '', endTime: '' };
    
    const parseTime = (timeStr: string): string => {
      const time = timeStr.trim().toLowerCase();
      const [timePart, period] = time.split(' ');
      const [hours, minutes] = timePart.split(':');
      let hour = parseInt(hours);
      
      if (period === 'pm' && hour !== 12) {
        hour += 12;
      } else if (period === 'am' && hour === 12) {
        hour = 0;
      }
      
      return `${hour.toString().padStart(2, '0')}:${minutes}`;
    };
    
    return {
      startTime: parseTime(parts[0]),
      endTime: parseTime(parts[1])
    };
  }

  /**
   * Get calendar days for a specific month
   * @param currentMonth - Date object representing the month
   * @returns Array of day numbers with null for empty cells
   */
  static getCalendarDays(currentMonth: Date): (number | null)[] {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const days: (number | null)[] = [];
    
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  }

  /**
   * Format date to YYYY-MM-DD string
   * @param day - Day number
   * @param currentMonth - Current month date object
   * @returns Formatted date string
   */
  static formatDate(day: number, currentMonth: Date): string {
    const year = currentMonth.getFullYear();
    const month = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  }

  /**
   * Get month name and year as string
   * @param currentMonth - Current month date object
   * @returns Formatted month and year string
   */
  static getMonthName(currentMonth: Date): string {
    return currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  /**
   * Get event type color class for styling
   * @param type - Event type
   * @returns CSS class for border color
   */
  static getEventTypeColor(type: string): string {
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
  }

  /**
   * Get event type badge component
   * @param type - Event type
   * @returns Badge variant string
   */
  static getEventTypeBadge(type: string): string {
    switch (type) {
      case 'workshop':
        return 'default';
      case 'consultation':
        return 'secondary';
      case 'training':
        return 'outline';
      case 'meeting':
        return 'destructive';
      default:
        return 'secondary';
    }
  }

  /**
   * Get upcoming events sorted by date
   * @param events - Array of calendar events
   * @param limit - Maximum number of events to return
   * @returns Sorted array of upcoming events
   */
  static getUpcomingEvents(events: CalendarEvent[], limit: number = 5): CalendarEvent[] {
    return [...events]
      .filter(event => event.status !== 'canceled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit);
  }

  /**
   * Check if a date is today
   * @param dateString - Date string to check
   * @returns True if date is today
   */
  static isToday(dateString: string): boolean {
    return new Date().toDateString() === new Date(dateString).toDateString();
  }

  /**
   * Validate time range
   * @param startTime - Start time string
   * @param endTime - End time string
   * @param date - Date string
   * @returns True if time range is valid
   */
  static validateTimeRange(startTime: string, endTime: string, date: string): boolean {
    if (!startTime || !endTime || !date) return false;
    
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    
    return !isNaN(startDateTime.getTime()) && 
           !isNaN(endDateTime.getTime()) && 
           endDateTime > startDateTime;
  }
} 