'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Target, DollarSign } from 'lucide-react';
import { AnalyticsService } from '@/lib/services/AnalyticsService';
import { FakeDataService } from '@/lib/services/FakeDataService';
import { useDashboardStore } from '@/lib/stores/dashboardStore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

type StatsData = {
  totalLeads: number;
  newLeads: number;
  conversionRate: number;
  avgResponseTime: number;
  totalRevenue: number;
  resourceDownloads: number;
};

interface DashboardStatsProps {
  period?: 'week' | 'month' | 'year';
}

export default function DashboardStats({ period = 'month' }: DashboardStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isFakeDataEnabled } = useDashboardStore();
  const fakeDataService = FakeDataService.getInstance();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (isFakeDataEnabled) {
          // Use fake data
          const fakeStats = fakeDataService.generateFakeStats();
          setStats({
            totalLeads: fakeStats.totalLeads,
            newLeads: fakeStats.newLeads,
            conversionRate: fakeStats.conversionRate,
            avgResponseTime: fakeStats.avgResponseTime,
            totalRevenue: fakeStats.totalRevenue,
            resourceDownloads: fakeStats.resourceDownloads,
          });
        } else {
          // Use real data with period
          const analyticsService = new AnalyticsService();
          const { data, error: analyticsError } = await analyticsService.getDashboardAnalytics(period);

          if (analyticsError) {
            throw new Error(analyticsError);
          }

          // Calculate additional stats based on period
          let newLeads = data.leadsThisMonth;
          if (period === 'week') {
            newLeads = Math.floor(data.leadsThisMonth / 4); // Approximate weekly leads
          } else if (period === 'year') {
            newLeads = data.leadsThisMonth * 12; // Approximate yearly leads
          }
          
          const avgResponseTime = 2.5; // Mock data - would come from actual response time tracking

          setStats({
            totalLeads: data.totalLeads,
            newLeads,
            conversionRate: data.conversionRate,
            avgResponseTime,
            totalRevenue: data.totalRevenue,
            resourceDownloads: data.resourceDownloads,
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [isFakeDataEnabled, period]);

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={`loading-skeleton-${i}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading statistics: {error}
          </AlertDescription>
        </Alert>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={`error-skeleton-${i}`} className="opacity-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">N/A</CardTitle>
                <div className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No data available</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No data available. Start by adding some leads, resources, and testimonials.
          </AlertDescription>
        </Alert>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={`no-data-skeleton-${i}`} className="opacity-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">No Data</CardTitle>
                <div className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No data available</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getPeriodDescription = () => {
    switch (period) {
      case 'week':
        return 'This week';
      case 'month':
        return 'This month';
      case 'year':
        return 'This year';
      default:
        return 'This month';
    }
  };

  const statCards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      description: 'All time leads',
      icon: Users,
      trend: stats.newLeads > 0 ? `+${stats.newLeads}` : '0',
      trendUp: stats.newLeads > 0,
    },
    {
      title: 'New Leads',
      value: stats.newLeads,
      description: getPeriodDescription(),
      icon: TrendingUp,
      trend: stats.newLeads > 0 ? '+5%' : '0%',
      trendUp: stats.newLeads > 0,
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      description: 'Lead to customer',
      icon: Target,
      trend: stats.conversionRate > 0 ? '+2.1%' : '0%',
      trendUp: stats.conversionRate > 0,
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      description: 'All time revenue',
      icon: DollarSign,
      trend: stats.totalRevenue > 0 ? `+$${(stats.totalRevenue * 0.1).toLocaleString()}` : '$0',
      trendUp: stats.totalRevenue > 0,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
            <div className="flex items-center mt-2">
              <Badge 
                variant={card.trendUp ? "default" : "secondary"}
                className="text-xs"
              >
                {card.trend}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 