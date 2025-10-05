import { useState, useEffect, useCallback } from 'react';
import { CalendlyConfigService } from '@/lib/services/CalendlyConfigService';
import type { CalendlyConfig } from '@/shared/types/entities';

export type CalendlyConfigState = {
  config: CalendlyConfig | null;
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;
};

export type CalendlyConfigActions = {
  updateConfig: (config: { bookingUrl: string; isActive?: boolean }) => Promise<boolean>;
  deleteConfig: () => Promise<boolean>;
  refreshConfig: () => Promise<void>;
  clearError: () => void;
};

/**
 * Custom hook for managing Calendly configuration
 * Provides state management and actions for admin calendar page
 */
export function useCalendlyConfig(): [CalendlyConfigState, CalendlyConfigActions] {
  const [state, setState] = useState<CalendlyConfigState>({
    config: null,
    isLoading: true,
    error: null,
    isUpdating: false,
  });

  const service = CalendlyConfigService.getInstance();

  /**
   * Fetch the current configuration
   */
  const fetchConfig = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await service.getConfig();
      
      if (result.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: result.error || 'Failed to fetch configuration' 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          config: result.data, 
          isLoading: false, 
          error: null 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
  }, [service]);

  /**
   * Update the configuration
   */
  const updateConfig = useCallback(async (config: { 
    bookingUrl: string; 
    isActive?: boolean 
  }): Promise<boolean> => {
    setState(prev => ({ ...prev, isUpdating: true, error: null }));
    
    try {
      const result = await service.updateConfig(config);
      
      if (result.error) {
        setState(prev => ({ 
          ...prev, 
          isUpdating: false, 
          error: result.error || 'Failed to update configuration' 
        }));
        return false;
      } else {
        setState(prev => ({ 
          ...prev, 
          config: result.data, 
          isUpdating: false, 
          error: null 
        }));
        return true;
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isUpdating: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
      return false;
    }
  }, [service]);

  /**
   * Delete the configuration
   */
  const deleteConfig = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isUpdating: true, error: null }));
    
    try {
      const result = await service.deleteConfig();
      
      if (result.error) {
        setState(prev => ({ 
          ...prev, 
          isUpdating: false, 
          error: result.error || 'Failed to delete configuration' 
        }));
        return false;
      } else {
        setState(prev => ({ 
          ...prev, 
          config: null, 
          isUpdating: false, 
          error: null 
        }));
        return true;
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isUpdating: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
      return false;
    }
  }, [service]);

  /**
   * Refresh the configuration
   */
  const refreshConfig = useCallback(async (): Promise<void> => {
    await fetchConfig();
  }, [fetchConfig]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Fetch config on mount
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const actions: CalendlyConfigActions = {
    updateConfig,
    deleteConfig,
    refreshConfig,
    clearError,
  };

  return [state, actions];
}
