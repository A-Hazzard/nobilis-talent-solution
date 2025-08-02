import { NextRequest, NextResponse } from 'next/server';
import { DownloadAnalyticsService } from '@/lib/services/DownloadAnalyticsService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') as '7d' | '30d' | '90d' || '30d';

    const analyticsService = DownloadAnalyticsService.getInstance();
    const response = await analyticsService.getAnalyticsExport(timeRange);

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to export analytics' },
        { status: 500 }
      );
    }

    // Return the analytics data as JSON
    return NextResponse.json(response.data, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="analytics-export-${timeRange}-${new Date().toISOString().split('T')[0]}.json"`
      }
    });
  } catch (error) {
    console.error('Error exporting analytics:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics' },
      { status: 500 }
    );
  }
} 