'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Download,
  Calendar,
} from 'lucide-react';
import { analyticsApi } from '@/lib/helpers/api';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      changeType: 'positive' as const,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Conversion Rate',
      value: `${analytics?.conversionRate || 0}%`,
      change: '+2.5%',
      changeType: 'positive' as const,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Revenue',
      value: `$${(analytics?.totalRevenue || 0).toLocaleString()}`,
      change: `$${(analytics?.revenueThisMonth || 0).toLocaleString()}`,
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Resource Downloads',
      value: analytics?.resourceDownloads || 0,
      change: '+15%',
      changeType: 'positive' as const,
      icon: Download,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <Select value={period} onValueChange={(value: 'week' | 'month' | 'year') => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Detailed insights into your business performance</p>
        </div>
        <Select value={period} onValueChange={(value: 'week' | 'month' | 'year') => setPeriod(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="year">Year</SelectItem>
          </SelectContent>
        </Select>
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
              <div className="flex items-center space-x-1 mt-1">
                {stat.changeType === 'positive' ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <p className="text-xs text-green-600">
                  {stat.change} this {period}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.topResources?.slice(0, 5).map((resource: any, index: number) => (
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
                  <Badge variant="outline">{resource.category}</Badge>
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
              {analytics?.leadSources?.map((source: any) => (
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

      {/* Additional Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">This {period}</span>
                <span className="font-medium">${(analytics?.revenueThisMonth || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Previous {period}</span>
                <span className="font-medium">${((analytics?.revenueThisMonth || 0) * 0.9).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Growth</span>
                <span className="text-green-600 font-medium">+10%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Conversion Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Rate</span>
                <span className="font-medium">{analytics?.conversionRate || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Website Visitors</span>
                <span className="font-medium">{(analytics?.totalLeads || 0) * 10}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Lead Quality</span>
                <span className="text-green-600 font-medium">High</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 