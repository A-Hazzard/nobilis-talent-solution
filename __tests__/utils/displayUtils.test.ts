import {
  displayOrganization,
  displayName,
  displayEmail,
  displayPhone,
  displayDate,
} from '@/lib/utils/displayUtils';

describe('displayUtils', () => {
  describe('displayOrganization', () => {
    it('should return organization name when valid', () => {
      expect(displayOrganization('Acme Corp')).toBe('Acme Corp');
      expect(displayOrganization('  Tech Solutions Inc  ')).toBe('  Tech Solutions Inc  ');
    });

    it('should return dash for invalid organizations', () => {
      expect(displayOrganization()).toBe('-');
      expect(displayOrganization('')).toBe('-');
      expect(displayOrganization('   ')).toBe('-');
      expect(displayOrganization('Not specified')).toBe('-');
    });
  });

  describe('displayName', () => {
    it('should return name when valid', () => {
      expect(displayName('John Doe')).toBe('John Doe');
      expect(displayName('Jane Smith')).toBe('Jane Smith');
    });

    it('should return dash for invalid names', () => {
      expect(displayName()).toBe('-');
      expect(displayName('')).toBe('-');
      expect(displayName('   ')).toBe('-');
    });

    it('should handle names with special characters', () => {
      expect(displayName("O'Connor")).toBe("O'Connor");
      expect(displayName('José María')).toBe('José María');
    });
  });

  describe('displayEmail', () => {
    it('should return email when valid', () => {
      expect(displayEmail('test@example.com')).toBe('test@example.com');
      expect(displayEmail('user.name+tag@domain.co.uk')).toBe('user.name+tag@domain.co.uk');
    });

    it('should return dash for invalid emails', () => {
      expect(displayEmail()).toBe('-');
      expect(displayEmail('')).toBe('-');
      expect(displayEmail('   ')).toBe('-');
    });

    it('should not validate email format, just check existence', () => {
      // The function doesn't validate email format, just checks if it exists
      expect(displayEmail('invalid-email')).toBe('invalid-email');
      expect(displayEmail('@')).toBe('@');
    });
  });

  describe('displayPhone', () => {
    it('should return phone when valid', () => {
      expect(displayPhone('123-456-7890')).toBe('123-456-7890');
      expect(displayPhone('+1 (555) 123-4567')).toBe('+1 (555) 123-4567');
      expect(displayPhone('5551234567')).toBe('5551234567');
    });

    it('should return dash for invalid phones', () => {
      expect(displayPhone()).toBe('-');
      expect(displayPhone('')).toBe('-');
      expect(displayPhone('   ')).toBe('-');
    });

    it('should handle international formats', () => {
      expect(displayPhone('+44 20 7946 0958')).toBe('+44 20 7946 0958');
      expect(displayPhone('+33 1 42 86 83 26')).toBe('+33 1 42 86 83 26');
    });
  });

  describe('displayDate', () => {
    it('should format valid dates correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = displayDate(date);
      
      // The exact format depends on locale, but should contain the date elements
      expect(result).toMatch(/1\/15\/2024|15\/01\/2024|2024-01-15/);
    });

    it('should handle Date objects', () => {
      const date = new Date(2024, 0, 15); // January 15, 2024
      const result = displayDate(date);
      
      expect(result).not.toBe('-');
      expect(result).toMatch(/1\/15\/2024|15\/1\/2024|2024/);
    });

    it('should return dash for invalid dates', () => {
      expect(displayDate()).toBe('-');
      expect(displayDate(undefined)).toBe('-');
    });

    it('should handle string dates by converting them', () => {
      // The function accepts Date objects, but internally uses new Date()
      const date = new Date('2024-12-25');
      const result = displayDate(date);
      
      expect(result).not.toBe('-');
      expect(result).toMatch(/12\/25\/2024|25\/12\/2024|2024/);
    });

    it('should handle invalid Date objects', () => {
      const invalidDate = new Date('invalid-date');
      const result = displayDate(invalidDate);
      
      // Invalid dates still get processed by toLocaleDateString
      // which typically returns "Invalid Date" or similar
      expect(result).toMatch(/Invalid Date|NaN/);
    });

    it('should handle edge case dates', () => {
      // Test leap year
      const leapDate = new Date('2024-02-29');
      const result = displayDate(leapDate);
      expect(result).toMatch(/2\/29\/2024|29\/2\/2024|2024/);

      // Test year boundary
      const newYear = new Date('2024-01-01T12:00:00Z');
      const newYearResult = displayDate(newYear);
      expect(newYearResult).toMatch(/1\/1\/2024|01\/01\/2024|31\/12\/2023|1\/1\/24/);
    });
  });

  // Integration tests
  describe('integration scenarios', () => {
    it('should handle user data display consistently', () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        organization: 'Acme Corp',
        phone: '555-1234',
        createdAt: new Date('2024-01-15'),
      };

      expect(displayName(userData.name)).toBe('John Doe');
      expect(displayEmail(userData.email)).toBe('john@example.com');
      expect(displayOrganization(userData.organization)).toBe('Acme Corp');
      expect(displayPhone(userData.phone)).toBe('555-1234');
      expect(displayDate(userData.createdAt)).not.toBe('-');
    });

    it('should handle empty user data gracefully', () => {
      const emptyUserData = {
        name: '',
        email: '',
        organization: '',
        phone: '',
        createdAt: undefined,
      };

      expect(displayName(emptyUserData.name)).toBe('-');
      expect(displayEmail(emptyUserData.email)).toBe('-');
      expect(displayOrganization(emptyUserData.organization)).toBe('-');
      expect(displayPhone(emptyUserData.phone)).toBe('-');
      expect(displayDate(emptyUserData.createdAt)).toBe('-');
    });

    it('should handle partially filled user data', () => {
      const partialUserData = {
        name: 'Jane Smith',
        email: '',
        organization: 'Not specified',
        phone: '555-9876',
        createdAt: new Date('2024-02-20'),
      };

      expect(displayName(partialUserData.name)).toBe('Jane Smith');
      expect(displayEmail(partialUserData.email)).toBe('-');
      expect(displayOrganization(partialUserData.organization)).toBe('-'); // "Not specified" -> "-"
      expect(displayPhone(partialUserData.phone)).toBe('555-9876');
      expect(displayDate(partialUserData.createdAt)).not.toBe('-');
    });
  });
});
