'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Gift, FileText } from 'lucide-react';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { useDashboardStore } from '@/lib/stores/dashboardStore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface DashboardStatsProps {
  period?: 'week' | 'month' | 'year';
}

export default function DashboardStats({ period = 'month' }: DashboardStatsProps) {
  const [dashboard] = useDashboard();
  const { isFakeDataEnabled: _isFakeDataEnabled } = useDashboardStore();

  const { isLoading, error, analytics } = dashboard;

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={`loading-skeleton-${i}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
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

  if (!analytics) {
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

  const _getPeriodDescription = () => {
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

  // Helper function to safely format numbers
  const safeFormatNumber = (value: number | undefined | null): string => {
    const num = Number(value || 0);
    return isNaN(num) ? '0' : num.toLocaleString();
  };

  const statCards = [
    {
      title: 'Total Leads',
      value: analytics.totalLeads || 0,
      description: 'All time leads',
      icon: Users,
      trend: (analytics.leadsThisMonth || 0) > 0 ? `+${analytics.leadsThisMonth || 0}` : '0',
      trendUp: (analytics.leadsThisMonth || 0) > 0,
    },
    {
      title: 'Total Revenue',
      value: `$${safeFormatNumber(analytics.totalRevenue)}`,
      description: 'All time revenue',
      icon: DollarSign,
      trend: (analytics.revenueThisMonth || 0) > 0 ? `+$${safeFormatNumber(analytics.revenueThisMonth)}` : '$0',
      trendUp: (analytics.revenueThisMonth || 0) > 0,
    },
    {
      title: 'Total Bonuses',
      value: `$${safeFormatNumber(analytics.totalBonuses)}`,
      description: 'All time bonuses',
      icon: Gift,
      trend: (analytics.bonusesThisMonth || 0) > 0 ? `+$${safeFormatNumber(analytics.bonusesThisMonth)}` : '$0',
      trendUp: (analytics.bonusesThisMonth || 0) > 0,
    },
    {
      title: 'Paid Invoices',
      value: analytics.totalInvoices || 0,
      description: 'All time paid invoices',
      icon: FileText,
      trend: (analytics.totalInvoices || 0) > 0 ? `${analytics.totalInvoices || 0} paid` : '0',
      trendUp: (analytics.totalInvoices || 0) > 0,
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