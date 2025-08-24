import { useState, useEffect, useCallback } from 'react';
import type { DashboardState, DashboardActions } from '@/lib/types/hooks';
import { analyticsApi } from '@/lib/helpers/api';
import { formatTimeAgo } from '@/lib/utils/auditUtils';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

/**
 * Custom hook for dashboard state management
 * Handles analytics data and period changes
 */
export function useDashboard(): [DashboardState, DashboardActions] {
  const [state, setState] = useState<DashboardState>({
    analytics: null,
    isLoading: true,
    period: 'month',
    recentActivity: [],
    error: null,
  });

  const loadDashboardData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Use real data only
      const response = await analyticsApi.getDashboard(state.period);
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          analytics: response.data!.analytics,
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
            totalRevenue: 0,
            revenueThisMonth: 0,
            totalBonuses: 0,
            bonusesThisMonth: 0,
            totalInvoices: 0,
            activeUsers: 0,
            resourceDownloads: 0,
            topResources: [],
            leadSources: [],
          },
          recentActivity: [],
        }));
      }

      // Fetch real recent activity from Firestore audit-logs collection (limit to 5)
      try {
        const q = query(collection(db, 'audit-logs'), orderBy('createdAt', 'desc'), limit(5));
        const snapshot = await getDocs(q);
        const recentActivity = snapshot.docs.map(doc => {
          const data = doc.data();
          
          // Parse details if it's a JSON string
          let parsedDetails = null;
          if (data.details) {
            try {
              parsedDetails = typeof data.details === 'string' ? JSON.parse(data.details) : data.details;
            } catch {
              console.warn('Failed to parse details:', data.details);
              parsedDetails = { title: data.details };
            }
          }
          
          return {
            action: data.action,
            entity: data.entity,
            entityId: data.entityId,
            entityTitle: parsedDetails?.title || data.entityId || '',
            time: formatTimeAgo(new Date(data.timestamp || data.createdAt?.toDate?.() || Date.now())),
            userEmail: data.userEmail,
            timestamp: data.timestamp || data.createdAt?.toDate?.() || Date.now(),
            details: parsedDetails,
          };
        });
        setState(prev => ({ ...prev, recentActivity }));
      } catch (error) {
        console.error('Error loading recent activity:', error);
        setState(prev => ({ ...prev, recentActivity: [] }));
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
              setState(prev => ({ 
          ...prev, 
          error: 'Failed to load dashboard data',
          analytics: {
            totalLeads: 0,
            leadsThisMonth: 0,
            totalRevenue: 0,
            revenueThisMonth: 0,
            totalBonuses: 0,
            bonusesThisMonth: 0,
            totalInvoices: 0,
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
  }, [state.period]);

  const setPeriod = useCallback((newPeriod: 'week' | 'month' | 'year') => {
    setState(prev => ({ ...prev, period: newPeriod }));
  }, []);

  const getStats = useCallback(() => {
    if (!state.analytics) return [];

    // Helper function to safely format numbers
    const safeFormatNumber = (value: number | undefined | null): string => {
      const num = Number(value || 0);
      return isNaN(num) ? '0' : num.toLocaleString();
    };

    return [
      {
        title: 'Total Leads',
        value: state.analytics.totalLeads || 0,
        change: state.analytics.leadsThisMonth || 0,
        icon: 'users',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      },
      {
        title: 'Total Revenue',
        value: `$${safeFormatNumber(state.analytics.totalRevenue)}`,
        change: `$${safeFormatNumber(state.analytics.revenueThisMonth)}`,
        icon: 'dollar-sign',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
      },
      {
        title: 'Total Bonuses',
        value: `$${safeFormatNumber(state.analytics.totalBonuses)}`,
        change: `$${safeFormatNumber(state.analytics.bonusesThisMonth)}`,
        icon: 'gift',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      },
      {
        title: 'Paid Invoices',
        value: state.analytics.totalInvoices || 0,
        change: 'This month',
        icon: 'file-text',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
      },
    ];
  }, [state.analytics]);

  // Reload data when period changes
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