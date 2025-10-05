import { useState, useEffect, useCallback } from 'react';
import { CalendlyConfigService } from '@/lib/services/CalendlyConfigService';

export type CalendlyBookingUrlState = {
  bookingUrl: string | null;
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
};

export type CalendlyBookingUrlActions = {
  refreshBookingUrl: () => Promise<void>;
  clearError: () => void;
};

/**
 * Custom hook for getting the current Calendly booking URL
 * Used by Book Now buttons throughout the application
 */
export function useCalendlyBookingUrl(): [CalendlyBookingUrlState, CalendlyBookingUrlActions] {
  const [state, setState] = useState<CalendlyBookingUrlState>({
    bookingUrl: null,
    isActive: false,
    isLoading: true,
    error: null,
  });

  const service = CalendlyConfigService.getInstance();

  /**
   * Fetch the current booking URL
   */
  const fetchBookingUrl = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await service.getBookingUrl();
      
      if (result.error) {
        // If there's an error, try to get fallback URL
        const fallbackUrl = service.getFallbackUrl();
        
        setState(prev => ({ 
          ...prev, 
          bookingUrl: fallbackUrl,
          isActive: !!fallbackUrl,
          isLoading: false, 
          error: result.error || 'Failed to fetch booking URL' 
        }));
      } else if (result.data) {
        setState(prev => ({ 
          ...prev, 
          bookingUrl: result.data!.bookingUrl,
          isActive: result.data!.isActive,
          isLoading: false, 
          error: null 
        }));
      } else {
        // No configuration found, try fallback
        const fallbackUrl = service.getFallbackUrl();
        
        setState(prev => ({ 
          ...prev, 
          bookingUrl: fallbackUrl,
          isActive: !!fallbackUrl,
          isLoading: false, 
          error: null 
        }));
      }
    } catch (error) {
      // On error, try to get fallback URL
      const fallbackUrl = service.getFallbackUrl();
      
      setState(prev => ({ 
        ...prev, 
        bookingUrl: fallbackUrl,
        isActive: !!fallbackUrl,
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
  }, [service]);

  /**
   * Refresh the booking URL
   */
  const refreshBookingUrl = useCallback(async (): Promise<void> => {
    await fetchBookingUrl();
  }, [fetchBookingUrl]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Fetch booking URL on mount
  useEffect(() => {
    fetchBookingUrl();
  }, [fetchBookingUrl]);

  const actions: CalendlyBookingUrlActions = {
    refreshBookingUrl,
    clearError,
  };

  return [state, actions];
}
