'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsService } from '@/lib/services/AnalyticsService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type ChartData = {
  leadsByMonth: {
    labels: string[];
    data: number[];
  };
  leadsByStatus: {
    labels: string[];
    data: number[];
  };
  leadsBySource: {
    labels: string[];
    data: number[];
  };
};

export default function DashboardCharts() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const analyticsService = new AnalyticsService();
        const { total, error: leadsError } = await analyticsService.getLeadsAnalytics();

        if (leadsError) {
          throw new Error(leadsError);
        }

        // Generate monthly data based on total leads (mock data for now)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const monthlyData = months.map(() => Math.floor(Math.random() * Math.max(total / 6, 1)) + 1);

        setChartData({
          leadsByMonth: {
            labels: months,
            data: monthlyData,
          },
          leadsByStatus: {
            labels: ['Total Leads'],
            data: [total],
          },
          leadsBySource: {
            labels: ['Users'],
            data: [total],
          },
        });
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chart data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] lg:h-[300px] bg-gray-200 rounded animate-pulse" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] lg:h-[300px] bg-gray-200 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading charts: {error}
          </AlertDescription>
        </Alert>
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Leads Overview</CardTitle>
              <CardDescription>Monthly lead generation trends</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[250px] lg:h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Lead Status</CardTitle>
              <CardDescription>Distribution by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] lg:h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No chart data available. Start by adding some leads to see analytics.
          </AlertDescription>
        </Alert>
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Leads Overview</CardTitle>
              <CardDescription>Monthly lead generation trends</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[250px] lg:h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Lead Status</CardTitle>
              <CardDescription>Distribution by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] lg:h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const lineChartData = {
    labels: chartData.leadsByMonth.labels,
    datasets: [
      {
        label: 'Leads',
        data: chartData.leadsByMonth.data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const doughnutChartData = {
    labels: chartData.leadsByStatus.labels,
    datasets: [
      {
        data: chartData.leadsByStatus.data,
        backgroundColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Leads Overview</CardTitle>
          <CardDescription>
            Monthly lead generation trends
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[250px] lg:h-[300px]">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </CardContent>
      </Card>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Lead Status</CardTitle>
          <CardDescription>
            Distribution by status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] lg:h-[300px]">
            <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 