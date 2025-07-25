'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import { useDashboard } from '@/lib/hooks/useDashboard';
import DashboardStats from '@/components/admin/DashboardStats';
import DashboardCharts from '@/components/admin/DashboardCharts';
import FakeDataToggle from '@/components/admin/FakeDataToggle';

// Force dynamic rendering to prevent pre-rendering issues
export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const [state, actions] = useDashboard();

  useEffect(() => {
    // Load dashboard data on mount
    actions.loadDashboardData();
  }, []); // Empty dependency array - only run on mount

  const { isLoading, period, recentActivity } = state;

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
    <div className="space-y-6">
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

      {/* Recent Activity */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{activity.action}</span>
                  <span className="text-muted-foreground">{activity.time}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 