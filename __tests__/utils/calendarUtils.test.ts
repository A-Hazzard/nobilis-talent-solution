import { CalendarUtils } from '@/lib/utils/calendarUtils';

describe('CalendarUtils', () => {
  describe('parseCalendlyTime', () => {
    it('should parse valid time range correctly', () => {
      const result = CalendarUtils.parseCalendlyTime('10:00:00 am - 10:30:00 am');
      expect(result.startTime).toBe('10:00');
      expect(result.endTime).toBe('10:30');
    });

    it('should handle PM times correctly', () => {
      const result = CalendarUtils.parseCalendlyTime('2:15:00 pm - 3:45:00 pm');
      expect(result.startTime).toBe('14:15');
      expect(result.endTime).toBe('15:45');
    });

    it('should handle noon correctly', () => {
      const result = CalendarUtils.parseCalendlyTime('12:00:00 pm - 1:00:00 pm');
      expect(result.startTime).toBe('12:00');
      expect(result.endTime).toBe('13:00');
    });

    it('should handle midnight correctly', () => {
      const result = CalendarUtils.parseCalendlyTime('12:00:00 am - 1:00:00 am');
      expect(result.startTime).toBe('00:00');
      expect(result.endTime).toBe('01:00');
    });

    it('should handle cross-day times', () => {
      const result = CalendarUtils.parseCalendlyTime('11:30:00 pm - 12:30:00 am');
      expect(result.startTime).toBe('23:30');
      expect(result.endTime).toBe('00:30');
    });

    it('should return empty strings for empty input', () => {
      const result = CalendarUtils.parseCalendlyTime('');
      expect(result.startTime).toBe('');
      expect(result.endTime).toBe('');
    });

    it('should return empty strings for invalid format', () => {
      const result = CalendarUtils.parseCalendlyTime('invalid time format');
      expect(result.startTime).toBe('');
      expect(result.endTime).toBe('');
    });

    it('should return empty strings for single time (no range)', () => {
      const result = CalendarUtils.parseCalendlyTime('10:00:00 am');
      expect(result.startTime).toBe('');
      expect(result.endTime).toBe('');
    });
  });

  describe('getCalendarDays', () => {
    it('should return correct days for January 2024', () => {
      const jan2024 = new Date(2024, 0, 1); // January 2024
      const days = CalendarUtils.getCalendarDays(jan2024);
      
      // January 2024 starts on Monday (index 1), so should have 1 null at start
      expect(days[0]).toBeNull();
      expect(days[1]).toBe(1);
      expect(days[31]).toBe(31); // Last day of January
      expect(days.length).toBe(32); // 1 null + 31 days
    });

    it('should return correct days for February 2024 (leap year)', () => {
      const feb2024 = new Date(2024, 1, 1); // February 2024
      const days = CalendarUtils.getCalendarDays(feb2024);
      
      // February 2024 starts on Thursday (index 4), so should have 4 nulls at start
      expect(days.slice(0, 4)).toEqual([null, null, null, null]);
      expect(days[4]).toBe(1);
      expect(days[32]).toBe(29); // Leap year has 29 days
      expect(days.length).toBe(33); // 4 nulls + 29 days
    });

    it('should return correct days for March 2024', () => {
      const mar2024 = new Date(2024, 2, 1); // March 2024
      const days = CalendarUtils.getCalendarDays(mar2024);
      
      // March 2024 starts on Friday (index 5), so should have 5 nulls at start
      expect(days.slice(0, 5)).toEqual([null, null, null, null, null]);
      expect(days[5]).toBe(1);
      expect(days[35]).toBe(31); // March has 31 days
      expect(days.length).toBe(36); // 5 nulls + 31 days
    });

    it('should return correct days for February 2023 (non-leap year)', () => {
      const feb2023 = new Date(2023, 1, 1); // February 2023
      const days = CalendarUtils.getCalendarDays(feb2023);
      
      // February 2023 has 28 days (non-leap year)
      expect(days[days.length - 1]).toBe(28);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const jan2024 = new Date(2024, 0, 1); // January 2024
      const result = CalendarUtils.formatDate(15, jan2024);
      expect(result).toBe('2024-01-15');
    });

    it('should pad single digit days and months', () => {
      const mar2024 = new Date(2024, 2, 1); // March 2024
      const result = CalendarUtils.formatDate(5, mar2024);
      expect(result).toBe('2024-03-05');
    });

    it('should handle December correctly', () => {
      const dec2024 = new Date(2024, 11, 1); // December 2024
      const result = CalendarUtils.formatDate(25, dec2024);
      expect(result).toBe('2024-12-25');
    });
  });

  describe('getMonthName', () => {
    it('should return correct month name and year', () => {
      const jan2024 = new Date(2024, 0, 1);
      const result = CalendarUtils.getMonthName(jan2024);
      expect(result).toBe('January 2024');
    });

    it('should handle different months correctly', () => {
      const dec2023 = new Date(2023, 11, 1);
      const result = CalendarUtils.getMonthName(dec2023);
      expect(result).toBe('December 2023');
    });
  });

  describe('getEventTypeColor', () => {
    it('should return correct color for workshop', () => {
      const result = CalendarUtils.getEventTypeColor('workshop');
      expect(result).toBe('border-l-blue-500');
    });

    it('should return correct color for consultation', () => {
      const result = CalendarUtils.getEventTypeColor('consultation');
      expect(result).toBe('border-l-green-500');
    });

    it('should return correct color for training', () => {
      const result = CalendarUtils.getEventTypeColor('training');
      expect(result).toBe('border-l-purple-500');
    });

    it('should return default color for unknown type', () => {
      const result = CalendarUtils.getEventTypeColor('unknown-type');
      expect(result).toBe('border-l-gray-500');
    });

    it('should return default color for empty string', () => {
      const result = CalendarUtils.getEventTypeColor('');
      expect(result).toBe('border-l-gray-500');
    });
  });




});
