'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { useDemoStore } from '@/lib/stores/demoStore';
import DashboardStats from '@/components/admin/DashboardStats';
import DashboardCharts from '@/components/admin/DashboardCharts';
import FakeDataToggle from '@/components/admin/FakeDataToggle';
import { 
  getEntityIcon, 
  getActionIcon, 
  getActionBadgeColors, 
  getEntityTypeBadgeColors,
  getActivityDescription 
} from '@/lib/utils/auditUtils';

// Force dynamic rendering to prevent pre-rendering issues
export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  const [dashboard, actions] = useDashboard();
  const { isDemoMode, toggleDemoMode } = useDemoStore();

  useEffect(() => {
    // Load dashboard data on mount
    actions.loadDashboardData();
  }, []); // Empty dependency array - only run on mount

  const { isLoading, period, recentActivity } = dashboard;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Welcome to your admin dashboard</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <Button
            variant={period === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => actions.setPeriod('week')}
            className="text-xs sm:text-sm"
          >
            Week
          </Button>
          <Button
            variant={period === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => actions.setPeriod('month')}
            className="text-xs sm:text-sm"
          >
            Month
          </Button>
          <Button
            variant={period === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => actions.setPeriod('year')}
            className="text-xs sm:text-sm"
          >
            Year
          </Button>
        </div>
      </div>

      {/* Demo Mode Toggle */}
      <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div>
          <h3 className="font-semibold text-blue-900">Demo Mode</h3>
          <p className="text-sm text-blue-700">
            {isDemoMode 
              ? 'Demo mode is enabled. You can see sample data and test features.'
              : 'Demo mode is disabled. You can enable it to see sample data.'
            }
          </p>
        </div>
        <Button
          variant={isDemoMode ? 'default' : 'outline'}
          onClick={toggleDemoMode}
          className={isDemoMode ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          {isDemoMode ? 'Disable Demo' : 'Enable Demo'}
        </Button>
      </div>

      {/* Demo Data Toggle */}
      <FakeDataToggle />

      {/* Stats Cards */}
      <DashboardStats period={period} />

      {/* Charts */}
      <DashboardCharts period={period} />

            {/* Recent Activity Section */}
      <section>
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow p-3 sm:p-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 py-3">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-gray-200 w-8 h-8 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                      <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activity found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {recentActivity.map((activity, idx) => {
                const entityIcon = getEntityIcon(activity.entity);
                const actionIcon = getActionIcon(activity.action);
                
                return (
                  <li key={idx} className="py-3 flex items-start gap-3">
                    {/* Entity Icon */}
                    <div className={`flex-shrink-0 p-2 rounded-lg ${entityIcon.bgColor}`}>
                      <entityIcon.Icon className={`h-4 w-4 ${entityIcon.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {/* Action Badge */}
                        <Badge className={`flex items-center gap-1 text-xs ${getActionBadgeColors(activity.action)}`}>
                          <actionIcon.Icon className="h-3 w-3" />
                          <span className="hidden sm:inline">{activity.action.toUpperCase()}</span>
                          <span className="sm:hidden">{activity.action}</span>
                        </Badge>
                        
                        {/* Entity Type Badge */}
                        <Badge className={`flex items-center gap-1 text-xs ${getEntityTypeBadgeColors(activity.entity)}`}>
                          <entityIcon.Icon className="h-3 w-3" />
                          <span className="hidden sm:inline">{activity.entity.toUpperCase()}</span>
                          <span className="sm:hidden capitalize">{activity.entity}</span>
                        </Badge>
                      </div>
                      
                      <p className="text-sm font-medium text-gray-900 break-words">
                        {getActivityDescription(activity)}
                      </p>
                      
                      <p className="text-xs text-gray-500 mt-1 break-all">
                        {activity.time}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
} 