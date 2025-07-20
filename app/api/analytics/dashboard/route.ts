import { NextRequest, NextResponse } from 'next/server';
import type { AnalyticsResponse } from '@/shared/types/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as 'week' | 'month' | 'year' || 'month';

    // Mock analytics data
    const mockAnalytics = {
      totalLeads: 156,
      leadsThisMonth: 23,
      conversionRate: 12.5,
      totalRevenue: 45000,
      revenueThisMonth: 8500,
      activeUsers: 89,
      resourceDownloads: 342,
      topResources: [
        { id: '1', title: 'Leadership Fundamentals Guide', downloads: 45 },
        { id: '2', title: 'Team Building Workshop', downloads: 38 },
        { id: '3', title: 'Communication Strategies', downloads: 32 },
        { id: '4', title: 'Strategic Planning Template', downloads: 28 },
        { id: '5', title: 'Performance Review Guide', downloads: 25 },
      ],
      leadSources: [
        { source: 'website', count: 67 },
        { source: 'referral', count: 34 },
        { source: 'social', count: 28 },
        { source: 'other', count: 27 },
      ],
    };

    const response: AnalyticsResponse = {
      analytics: mockAnalytics,
      period,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 