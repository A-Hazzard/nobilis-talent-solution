import { useState, useEffect, useCallback } from 'react';
import type { Analytics } from '@/shared/types/entities';
import { analyticsApi } from '@/lib/helpers/api';
import { FakeDataService } from '@/lib/services/FakeDataService';
import { useDashboardStore } from '@/lib/stores/dashboardStore';

import { formatTimeAgo } from '@/lib/utils/auditUtils';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface DashboardState {
  analytics: Analytics | null;
  isLoading: boolean;
  period: 'week' | 'month' | 'year';
  recentActivity: any[];
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
        
        setState(prev => ({
          ...prev,
          analytics: fakeAnalytics,
          recentActivity: fakeRecentActivity,
        }));
      } else {
        // Use real data
        const response = await analyticsApi.getDashboard(state.period);
        if (response.success && response.data) {
          setState(prev => ({
            ...prev,
            analytics: response.data as Analytics,
            recentActivity: [],
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
          }));
        }

        // Fetch real recent activity from Firestore
        try {
          const q = query(collection(db, 'adminLogs'), orderBy('timestamp', 'desc'), limit(10));
          const snapshot = await getDocs(q);
          const recentActivity = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              action: data.action,
              entity: data.entity,
              entityId: data.entityId,
              entityTitle: data.details?.title || data.entityId || '',
              time: formatTimeAgo(new Date(data.timestamp)),
              userEmail: data.userEmail,
              timestamp: data.timestamp,
            };
          });
          setState(prev => ({ ...prev, recentActivity }));
        } catch {
          setState(prev => ({ ...prev, recentActivity: [] }));
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
        recentActivity: [],
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [isFakeDataEnabled, state.period]);

  const setPeriod = useCallback((newPeriod: 'week' | 'month' | 'year') => {
    setState(prev => ({ ...prev, period: newPeriod }));
  }, []);

  const getStats = useCallback(() => {
    if (!state.analytics) return [];

    return [
      {
        title: 'Total Leads',
        value: state.analytics.totalLeads,
        change: state.analytics.leadsThisMonth,
        icon: 'users',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      },
      {
        title: 'Conversion Rate',
        value: `${state.analytics.conversionRate}%`,
        change: '+2.5%',
        icon: 'trending-up',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      },
      {
        title: 'Total Revenue',
        value: `$${state.analytics.totalRevenue.toLocaleString()}`,
        change: `$${state.analytics.revenueThisMonth.toLocaleString()}`,
        icon: 'dollar-sign',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
      },
      {
        title: 'Active Users',
        value: state.analytics.activeUsers,
        change: '+12',
        icon: 'users',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
      },
    ];
  }, [state.analytics]);

  // Reload data when period changes or fake data is toggled
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const actions: DashboardActions = {
    loadDashboardData,
    setPeriod,
    getStats,
  };

  return [state, actions];
}