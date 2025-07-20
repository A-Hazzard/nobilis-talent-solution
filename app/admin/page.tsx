'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  Star, 
  TrendingUp, 
  DollarSign, 
  Download,
  Calendar,
  Target,
  Plus
} from 'lucide-react';
import { analyticsApi } from '@/lib/helpers/api';
import { FakeDataService } from '@/lib/services/FakeDataService';
import { useDashboardStore } from '@/lib/stores/dashboardStore';
import type { Analytics } from '@/shared/types/entities';
import DashboardStats from '@/components/admin/DashboardStats';
import DashboardCharts from '@/components/admin/DashboardCharts';
import FakeDataToggle from '@/components/admin/FakeDataToggle';
import Link from 'next/link';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  const { isFakeDataEnabled } = useDashboardStore();
  const fakeDataService = FakeDataService.getInstance();

  useEffect(() => {
    loadDashboardData();
  }, [period, isFakeDataEnabled]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      if (isFakeDataEnabled) {
        // Use fake data
        const fakeAnalytics = fakeDataService.generateFakeAnalytics();
        setAnalytics(fakeAnalytics);
        setRecentActivity(fakeDataService.generateFakeRecentActivity());
        setPerformanceMetrics(fakeDataService.generateFakePerformanceMetrics());
        setUpcomingEvents(fakeDataService.generateFakeUpcomingEvents());
      } else {
        // Use real data
        const response = await analyticsApi.getDashboard(period);
        if (response.success && response.data) {
          setAnalytics(response.data);
        } else {
          console.error('Failed to load analytics:', response.error);
          // Set default empty analytics to prevent errors
          setAnalytics({
            totalLeads: 0,
            leadsThisMonth: 0,
            conversionRate: 0,
            totalRevenue: 0,
            revenueThisMonth: 0,
            activeUsers: 0,
            resourceDownloads: 0,
            topResources: [],
            leadSources: [],
          });
        }
        
        // Set empty arrays for real data (these would come from actual API calls)
        setRecentActivity([]);
        setPerformanceMetrics([]);
        setUpcomingEvents([]);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set default empty analytics to prevent errors
      setAnalytics({
        totalLeads: 0,
        leadsThisMonth: 0,
        conversionRate: 0,
        totalRevenue: 0,
        revenueThisMonth: 0,
        activeUsers: 0,
        resourceDownloads: 0,
        topResources: [],
        leadSources: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Leads',
      value: analytics?.totalLeads || 0,
      change: analytics?.leadsThisMonth || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Conversion Rate',
      value: `${analytics?.conversionRate || 0}%`,
      change: '+2.5%',
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Revenue',
      value: `$${(analytics?.totalRevenue || 0).toLocaleString()}`,
      change: `$${(analytics?.revenueThisMonth || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Resource Downloads',
      value: analytics?.resourceDownloads || 0,
      change: '+15%',
      icon: Download,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex space-x-2">
            {['week', 'month', 'year'].map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(p as 'week' | 'month' | 'year')}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your admin dashboard. Here's an overview of your business.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FakeDataToggle />
          <Button asChild>
            <Link href="/admin/leads">
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Charts */}
      <DashboardCharts />

      {/* Quick Actions */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/leads">
                <Users className="mr-2 h-4 w-4" />
                Manage Leads
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/resources">
                <FileText className="mr-2 h-4 w-4" />
                View Resources
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/calendar">
                <Calendar className="mr-2 h-4 w-4" />
                Check Calendar
              </Link>
            </Button>
          </CardContent>
        </Card>

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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {performanceMetrics.length > 0 ? (
              performanceMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{metric.metric}</span>
                  <Badge variant="secondary" className="text-xs">
                    {metric.value}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                No performance data
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{event.event}</span>
                  <span className="text-muted-foreground">{event.time}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                No upcoming events
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 