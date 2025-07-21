import { useState, useEffect, useCallback } from 'react';
import type { Analytics } from '@/shared/types/entities';
import { analyticsApi } from '@/lib/helpers/api';
import { FakeDataService } from '@/lib/services/FakeDataService';
import { useDashboardStore } from '@/lib/stores/dashboardStore';

export interface DashboardState {
  analytics: Analytics | null;
  isLoading: boolean;
  period: 'week' | 'month' | 'year';
  recentActivity: any[];
  performanceMetrics: any[];
  upcomingEvents: any[];
  error: string | null;
}

export interface DashboardActions {
  loadDashboardData: () => Promise<void>;
  setPeriod: (period: 'week' | 'month' | 'year') => void;
  getStats: () => Array<{
    title: string;
    value: string | number;
    change: string | number;
    icon: any;
    color: string;
    bgColor: string;
  }>;
}

/**
 * Custom hook for dashboard state management
 * Handles analytics data, fake data toggling, and period changes
 */
export function useDashboard(): [DashboardState, DashboardActions] {
  const [state, setState] = useState<DashboardState>({
    analytics: null,
    isLoading: true,
    period: 'month',
    recentActivity: [],
    performanceMetrics: [],
    upcomingEvents: [],
    error: null,
  });

  const { isFakeDataEnabled } = useDashboardStore();
  const fakeDataService = FakeDataService.getInstance();

  const loadDashboardData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      if (isFakeDataEnabled) {
        // Use fake data
        const fakeAnalytics = fakeDataService.generateFakeAnalytics();
        const fakeRecentActivity = fakeDataService.generateFakeRecentActivity();
        const fakePerformanceMetrics = fakeDataService.generateFakePerformanceMetrics();
        const fakeUpcomingEvents = fakeDataService.generateFakeUpcomingEvents();
        
        setState(prev => ({
          ...prev,
          analytics: fakeAnalytics,
          recentActivity: fakeRecentActivity,
          performanceMetrics: fakePerformanceMetrics,
          upcomingEvents: fakeUpcomingEvents,
        }));
      } else {
        // Use real data
        const response = await analyticsApi.getDashboard(state.period);
        if (response.success && response.data) {
          setState(prev => ({
            ...prev,
            analytics: response.data as Analytics,
            recentActivity: [],
            performanceMetrics: [],
            upcomingEvents: [],
          }));
        } else {
          console.error('Failed to load analytics:', response.error);
          // Set default empty analytics to prevent errors
          setState(prev => ({
            ...prev,
            analytics: {
              totalLeads: 0,
              leadsThisMonth: 0,
              conversionRate: 0,
              totalRevenue: 0,
              revenueThisMonth: 0,
              activeUsers: 0,
              resourceDownloads: 0,
              topResources: [],
              leadSources: [],
            },
            recentActivity: [],
            performanceMetrics: [],
            upcomingEvents: [],
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load dashboard data',
        analytics: {
          totalLeads: 0,
          leadsThisMonth: 0,
          conversionRate: 0,
          totalRevenue: 0,
          revenueThisMonth: 0,
          activeUsers: 0,
          resourceDownloads: 0,
          topResources: [],
          leadSources: [],
        },
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [isFakeDataEnabled, state.period, fakeDataService]);

  const setPeriod = useCallback((period: 'week' | 'month' | 'year') => {
    setState(prev => ({ ...prev, period }));
  }, []);

  const getStats = useCallback(() => {
    const { analytics } = state;
    return [
      {
        title: 'Total Leads',
        value: analytics?.totalLeads || 0,
        change: analytics?.leadsThisMonth || 0,
        icon: 'Users',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      },
      {
        title: 'Conversion Rate',
        value: `${analytics?.conversionRate || 0}%`,
        change: '+2.5%',
        icon: 'Target',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      },
      {
        title: 'Total Revenue',
        value: `$${(analytics?.totalRevenue || 0).toLocaleString()}`,
        change: `$${(analytics?.revenueThisMonth || 0).toLocaleString()}`,
        icon: 'DollarSign',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
      },
      {
        title: 'Resource Downloads',
        value: analytics?.resourceDownloads || 0,
        change: '+15%',
        icon: 'Download',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
      },
    ];
  }, [state.analytics]);

  // Separate effect for initial load
  useEffect(() => {
    loadDashboardData();
  }, []); // Only run on mount

  // Separate effect for period changes
  useEffect(() => {
    if (state.period) {
      loadDashboardData();
    }
  }, [state.period]); // Only depend on period

  const actions: DashboardActions = {
    loadDashboardData,
    setPeriod,
    getStats,
  };

  return [state, actions];
}