import {
  validateEmail,
  validatePassword,
  validateName,
  validateOrganization,
  validatePasswordConfirmation,
  validateLoginForm,
  validateSignupForm,
  validatePhone
} from '@/lib/utils/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toEqual({ isValid: true });
      expect(validateEmail('user.name@domain.co.uk')).toEqual({ isValid: true });
      expect(validateEmail('test+tag@example.org')).toEqual({ isValid: true });
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toEqual({ 
        isValid: false, 
        error: 'Please enter a valid email address' 
      });
      expect(validateEmail('test@')).toEqual({ 
        isValid: false, 
        error: 'Please enter a valid email address' 
      });
      expect(validateEmail('@example.com')).toEqual({ 
        isValid: false, 
        error: 'Please enter a valid email address' 
      });
      expect(validateEmail('test@.com')).toEqual({ 
        isValid: false, 
        error: 'Please enter a valid email address' 
      });
    });

    it('should reject empty email addresses', () => {
      expect(validateEmail('')).toEqual({ 
        isValid: false, 
        error: 'Email is required' 
      });
      expect(validateEmail('   ')).toEqual({ 
        isValid: false, 
        error: 'Email is required' 
      });
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.hasMinLength).toBe(true);
      expect(result.hasUppercase).toBe(true);
      expect(result.hasLowercase).toBe(true);
      expect(result.hasNumber).toBe(true);
      expect(result.hasSpecialChar).toBe(true);
    });

    it('should reject weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Password must contain');
    });

    it('should reject empty passwords', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password is required');
    });
  });

  describe('validateName', () => {
    it('should validate correct names', () => {
      expect(validateName('John')).toEqual({ isValid: true });
      expect(validateName('Mary-Jane')).toEqual({ isValid: true });
      expect(validateName("O'Connor")).toEqual({ isValid: true });
    });

    it('should reject invalid names', () => {
      expect(validateName('Jo')).toEqual({ 
        isValid: false, 
        error: 'Name must be at least 3 characters long' 
      });
      expect(validateName('John123')).toEqual({ 
        isValid: false, 
        error: 'Name can only contain letters, spaces, hyphens, and apostrophes' 
      });
    });

    it('should reject empty names', () => {
      expect(validateName('')).toEqual({ 
        isValid: false, 
        error: 'Name is required' 
      });
    });
  });

  describe('validateOrganization', () => {
    it('should validate correct organization names', () => {
      expect(validateOrganization('Acme Corp')).toEqual({ isValid: true });
      expect(validateOrganization('Smith & Sons, Inc.')).toEqual({ isValid: true });
      expect(validateOrganization('')).toEqual({ isValid: true }); // Optional
    });

    it('should reject invalid organization names', () => {
      expect(validateOrganization('Ab')).toEqual({ 
        isValid: false, 
        error: 'Organization must be at least 3 characters long' 
      });
      expect(validateOrganization('Acme@Corp')).toEqual({ 
        isValid: false, 
        error: 'Organization contains invalid characters' 
      });
    });
  });

  describe('validatePasswordConfirmation', () => {
    it('should validate matching passwords', () => {
      expect(validatePasswordConfirmation('password123', 'password123')).toEqual({ isValid: true });
    });

    it('should reject non-matching passwords', () => {
      expect(validatePasswordConfirmation('password123', 'password456')).toEqual({ 
        isValid: false, 
        error: 'Passwords do not match' 
      });
    });

    it('should reject empty confirmation', () => {
      expect(validatePasswordConfirmation('password123', '')).toEqual({ 
        isValid: false, 
        error: 'Please confirm your password' 
      });
    });
  });

  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      expect(validatePhone('+1-555-123-4567')).toEqual({ isValid: true });
      expect(validatePhone('(555) 123-4567')).toEqual({ isValid: true });
      expect(validatePhone('555-123-4567')).toEqual({ isValid: true });
      expect(validatePhone('')).toEqual({ isValid: true }); // Optional
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('not-a-number')).toEqual({ 
        isValid: false, 
        error: 'Please enter a valid phone number' 
      });
      expect(validatePhone('0123456789')).toEqual({ 
        isValid: false, 
        error: 'Please enter a valid phone number' 
      });
    });
  });

  describe('validateLoginForm', () => {
    it('should validate correct login data', () => {
      const result = validateLoginForm('test@example.com', 'StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors.email).toBeUndefined();
      expect(result.errors.password).toBeUndefined();
    });

    it('should reject invalid login data', () => {
      const result = validateLoginForm('invalid-email', 'weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
    });
  });

  describe('validateSignupForm', () => {
    it('should validate correct signup data', () => {
      const signupData = {
        email: 'test@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        firstName: 'John',
        lastName: 'Doe',
        organization: 'Acme Corp',
        phone: '+1-555-123-4567'
      };

      const result = validateSignupForm(signupData);
      expect(result.isValid).toBe(true);
      expect(result.errors.email).toBeUndefined();
      expect(result.errors.password).toBeUndefined();
      expect(result.errors.firstName).toBeUndefined();
      expect(result.errors.lastName).toBeUndefined();
    });

    it('should reject invalid signup data', () => {
      const signupData = {
        email: 'invalid-email',
        password: 'weak',
        confirmPassword: 'different',
        firstName: 'Jo',
        lastName: 'Do',
        organization: 'Acme@Corp',
        phone: 'invalid-phone'
      };

      const result = validateSignupForm(signupData);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
      expect(result.errors.confirmPassword).toBeDefined();
      expect(result.errors.firstName).toBeDefined();
      expect(result.errors.lastName).toBeDefined();
    });
  });
});
