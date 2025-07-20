/**
 * Validation utilities for form inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PasswordValidationResult extends ValidationResult {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasSpecialChar: boolean;
}

/**
 * Validates email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): PasswordValidationResult {
  if (!password || password.trim() === '') {
    return {
      isValid: false,
      error: 'Password is required',
      hasMinLength: false,
      hasUppercase: false,
      hasSpecialChar: false
    };
  }

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const isValid = hasMinLength && hasUppercase && hasSpecialChar;

  let error: string | undefined;
  if (!isValid) {
    const missingRequirements = [];
    if (!hasMinLength) missingRequirements.push('at least 8 characters');
    if (!hasUppercase) missingRequirements.push('1 uppercase letter');
    if (!hasSpecialChar) missingRequirements.push('1 special character');
    
    error = `Password must contain ${missingRequirements.join(', ')}`;
  }

  return {
    isValid,
    error,
    hasMinLength,
    hasUppercase,
    hasSpecialChar
  };
}

/**
 * Validates name (first name or last name)
 */
export function validateName(name: string, fieldName: string = 'Name'): ValidationResult {
  if (!name || name.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (name.trim().length < 3) {
    return { isValid: false, error: `${fieldName} must be at least 3 characters long` };
  }

  // Check if name contains only letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(name.trim())) {
    return { isValid: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
  }

  return { isValid: true };
}

/**
 * Validates organization name
 */
export function validateOrganization(organization: string): ValidationResult {
  // Organization is optional, so empty is valid
  if (!organization || organization.trim() === '') {
    return { isValid: true };
  }

  if (organization.trim().length < 3) {
    return { isValid: false, error: 'Organization must be at least 3 characters long' };
  }

  // Allow letters, numbers, spaces, hyphens, and common punctuation
  const orgRegex = /^[a-zA-Z0-9\s\-'.,&()]+$/;
  if (!orgRegex.test(organization.trim())) {
    return { isValid: false, error: 'Organization contains invalid characters' };
  }

  return { isValid: true };
}

/**
 * Validates password confirmation
 */
export function validatePasswordConfirmation(password: string, confirmPassword: string): ValidationResult {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true };
}

/**
 * Validates login form
 */
export function validateLoginForm(email: string, password: string): {
  isValid: boolean;
  errors: { email?: string; password?: string };
} {
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);

  return {
    isValid: emailValidation.isValid && passwordValidation.isValid,
    errors: {
      email: emailValidation.error,
      password: passwordValidation.error
    }
  };
}

/**
 * Validates signup form
 */
export function validateSignupForm(data: {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  organization: string;
  phone?: string;
}): {
  isValid: boolean;
  errors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    organization?: string;
    phone?: string;
  };
} {
  const emailValidation = validateEmail(data.email);
  const passwordValidation = validatePassword(data.password);
  const confirmPasswordValidation = validatePasswordConfirmation(data.password, data.confirmPassword);
  const firstNameValidation = validateName(data.firstName, 'First name');
  const lastNameValidation = validateName(data.lastName, 'Last name');
  const organizationValidation = validateOrganization(data.organization);
  const phoneValidation = validatePhone(data.phone || '');

  return {
    isValid: emailValidation.isValid && 
             passwordValidation.isValid && 
             confirmPasswordValidation.isValid && 
             firstNameValidation.isValid && 
             lastNameValidation.isValid && 
             organizationValidation.isValid &&
             phoneValidation.isValid,
    errors: {
      email: emailValidation.error,
      password: passwordValidation.error,
      confirmPassword: confirmPasswordValidation.error,
      firstName: firstNameValidation.error,
      lastName: lastNameValidation.error,
      organization: organizationValidation.error,
      phone: phoneValidation.error
    }
  };
}

/**
 * Validates phone number format
 */
export function validatePhone(phone: string): ValidationResult {
  // Phone is optional, so empty is valid
  if (!phone || phone.trim() === '') {
    return { isValid: true };
  }

  // Basic phone number validation - allows various formats
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }

  return { isValid: true };
} 