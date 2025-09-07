/**
 * Type definitions for validation utilities
 */

export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

export type PasswordValidationResult = {
  isValid: boolean;
  error?: string;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
};
