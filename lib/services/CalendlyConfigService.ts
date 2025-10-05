import type { CalendlyConfig } from '@/shared/types/entities';

export type CalendlyConfigResponse = {
  data: CalendlyConfig | null;
  error?: string;
};

export type CalendlyBookingUrlResponse = {
  data: {
    bookingUrl: string;
    isActive: boolean;
  } | null;
  error?: string;
};

/**
 * Service for managing Calendly configuration
 * Handles CRUD operations for Calendly booking URLs
 */
export class CalendlyConfigService {
  private static instance: CalendlyConfigService;
  private readonly baseUrl = '/api/calendly';

  private constructor() {}

  static getInstance(): CalendlyConfigService {
    if (!CalendlyConfigService.instance) {
      CalendlyConfigService.instance = new CalendlyConfigService();
    }
    return CalendlyConfigService.instance;
  }

  /**
   * Get the current Calendly configuration (admin only)
   */
  async getConfig(): Promise<CalendlyConfigResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { data: null, error: errorData.error || 'Failed to fetch configuration' };
      }

      const result = await response.json();
      return { data: result.data };
    } catch (error) {
      console.error('Error fetching Calendly config:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Update the Calendly configuration (admin only)
   */
  async updateConfig(config: {
    bookingUrl: string;
    isActive?: boolean;
  }): Promise<CalendlyConfigResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { data: null, error: errorData.error || 'Failed to update configuration' };
      }

      const result = await response.json();
      return { data: result.data };
    } catch (error) {
      console.error('Error updating Calendly config:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Delete the Calendly configuration (admin only)
   */
  async deleteConfig(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/config`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to delete configuration' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting Calendly config:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get the current active Calendly booking URL (public)
   * This is used by Book Now buttons throughout the application
   */
  async getBookingUrl(): Promise<CalendlyBookingUrlResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/booking-url`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { data: null, error: errorData.error || 'Failed to fetch booking URL' };
      }

      const result = await response.json();
      return { data: result.data };
    } catch (error) {
      console.error('Error fetching Calendly booking URL:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Validate a Calendly URL
   */
  validateCalendlyUrl(url: string): { isValid: boolean; error?: string } {
    if (!url || typeof url !== 'string') {
      return { isValid: false, error: 'URL is required' };
    }

    try {
      const urlObj = new URL(url);
      
      if (!urlObj.hostname.includes('calendly.com')) {
        return { isValid: false, error: 'URL must be a valid Calendly booking link' };
      }

      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  }

  /**
   * Get a fallback URL from environment variables
   * This is used when no configuration is found in the database
   */
  getFallbackUrl(): string | null {
    if (typeof window === 'undefined') {
      // Server-side: use environment variable
      return process.env.NEXT_PUBLIC_CALENDLY_URL || null;
    }
    
    // Client-side: we can't access env vars directly, so return null
    // The component should handle this case
    return null;
  }
}
