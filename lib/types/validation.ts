/**
 * Frontend validation types for form inputs
 */

export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

export type PasswordValidationResult = ValidationResult & {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasSpecialChar: boolean;
}; 