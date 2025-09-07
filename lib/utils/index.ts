/**
 * Utility functions for the application
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and tailwind-merge
 * This is the standard cn utility function used throughout the app
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Gets the base URL for the application
 * Handles both development and production environments
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side
    return window.location.origin;
  }
  
  if (process.env.VERCEL_URL) {
    // Vercel deployment
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.NEXT_PUBLIC_APP_URL) {
    // Custom environment variable
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Fallback for development
  return 'http://localhost:3000';
}

// Re-export all utility functions from other files
export * from './auditUtils';
export * from './authUtils';
export * from './calendarUtils';
export * from './currency';
export * from './migrateAuthProvider';
export * from './testimonialUtils';
export * from './validation';
