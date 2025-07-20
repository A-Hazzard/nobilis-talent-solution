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
  Target
} from 'lucide-react';
import { analyticsApi } from '@/lib/helpers/api';
import type { Analytics } from '@/shared/types/entities';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
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
    } catch (error) {
      console.error('Failed to load analytics:', error);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your leadership coaching business</p>
        </div>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-green-600 mt-1">
                {stat.change} this {period}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Top Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.topResources?.slice(0, 5).map((resource, index) => (
                <div key={resource.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                      <span className="text-sm font-semibold text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{resource.title}</p>
                                             <p className="text-sm text-gray-500">{resource.downloads} downloads</p>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4">
                  <p className="text-gray-500">No resources available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Lead Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.leadSources?.map((source) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="capitalize">
                      {source.source}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{source.count}</p>
                    <p className="text-sm text-gray-500">leads</p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4">
                  <p className="text-gray-500">No lead sources available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center gap-2">
              <Users className="h-6 w-6" />
              <span>View All Leads</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <FileText className="h-6 w-6" />
              <span>Add Resource</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <Star className="h-6 w-6" />
              <span>Add Testimonial</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 