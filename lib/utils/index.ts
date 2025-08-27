import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the current domain and base URL dynamically
 * This ensures links work correctly regardless of the domain
 */
export function getCurrentDomain(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use the current window location
    return window.location.origin;
  }
  
  // Server-side: use environment variable or fallback
  // Check for VERCEL_URL first (for Vercel deployments)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Check for custom app URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Check for host header (for other deployments)
  if (process.env.HOST) {
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    return `${protocol}://${process.env.HOST}`;
  }
  
  // Fallback to localhost for development
  return 'http://localhost:3000';
}

/**
 * Get the current base URL with protocol
 */
export function getBaseUrl(): string {
  return getCurrentDomain();
}

/**
 * Create a full URL from a path
 */
export function createUrl(path: string): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
