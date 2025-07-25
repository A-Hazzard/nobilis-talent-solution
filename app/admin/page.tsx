'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDashboard } from '@/lib/hooks/useDashboard';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your admin dashboard</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={period === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => actions.setPeriod('week')}
          >
            Week
          </Button>
          <Button
            variant={period === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => actions.setPeriod('month')}
          >
            Month
          </Button>
          <Button
            variant={period === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => actions.setPeriod('year')}
          >
            Year
          </Button>
        </div>
      </div>

      {/* Demo Data Toggle */}
      <FakeDataToggle />

      {/* Stats Cards */}
      <DashboardStats period={period} />

      {/* Charts */}
      <DashboardCharts period={period} />

      {/* Recent Activity Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow p-4">
          {recentActivity.length === 0 ? (
            <p className="text-gray-500">No recent activity found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {recentActivity.map((activity, idx) => {
                const entityIcon = getEntityIcon(activity.entity);
                const actionIcon = getActionIcon(activity.action);
                
                return (
                  <li key={idx} className="py-3 flex items-center gap-3">
                    {/* Entity Icon */}
                    <div className={`flex-shrink-0 p-2 rounded-lg ${entityIcon.bgColor}`}>
                      <entityIcon.Icon className={`h-4 w-4 ${entityIcon.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {/* Action Badge */}
                        <Badge className={`flex items-center gap-1 text-xs ${getActionBadgeColors(activity.action)}`}>
                          <actionIcon.Icon className="h-3 w-3" />
                          {activity.action.toUpperCase()}
                        </Badge>
                        
                        {/* Entity Type Badge */}
                        <Badge className={`flex items-center gap-1 text-xs ${getEntityTypeBadgeColors(activity.entity)}`}>
                          <entityIcon.Icon className="h-3 w-3" />
                          {activity.entity.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-sm font-medium text-gray-900">
                        {activity.entityTitle || activity.entityId || getActivityDescription(activity)}
                      </p>
                      
                      <p className="text-xs text-gray-500">
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