import { NextRequest, NextResponse } from 'next/server';
import { DownloadAnalyticsService } from '@/lib/services/DownloadAnalyticsService';
import * as XLSX from 'xlsx';

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

    // Create Excel workbook
    const workbook = XLSX.utils.book_new();

    // Analytics Overview Sheet
    const overviewData = [
      ['Analytics Overview', ''],
      ['', ''],
      ['Time Range', timeRange],
      ['Export Date', new Date().toLocaleDateString()],
      ['', ''],
      ['Key Metrics', 'Value'],
      ['Total Downloads', response.data.totalDownloads || 0],
      ['Downloads Today', response.data.downloadsToday || 0],
      ['Downloads This Week', response.data.downloadsThisWeek || 0],
      ['Downloads This Month', response.data.downloadsThisMonth || 0],
      ['', ''],
      ['Popular Resources', 'Downloads'],
    ];

    // Add popular resources
    if (response.data.popularResources) {
      response.data.popularResources.forEach((resource: any) => {
        overviewData.push([resource.title, resource.downloadCount]);
      });
    }

    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');

    // Recent Downloads Sheet
    if (response.data.recentDownloads && response.data.recentDownloads.length > 0) {
      const recentDownloadsData = [
        ['Recent Downloads'],
        ['', ''],
        ['Resource', 'User', 'Download Date', 'IP Address']
      ];

      response.data.recentDownloads.forEach((download: any) => {
        recentDownloadsData.push([
          download.resourceTitle || 'Unknown',
          download.userEmail || 'Anonymous',
          new Date(download.downloadedAt).toLocaleDateString(),
          download.ipAddress || 'Unknown'
        ]);
      });

      const recentSheet = XLSX.utils.aoa_to_sheet(recentDownloadsData);
      XLSX.utils.book_append_sheet(workbook, recentSheet, 'Recent Downloads');
    }

    // Download Trends Sheet
    const trendsData = [
      ['Download Trends'],
      ['', ''],
      ['Period', 'Downloads']
    ];

    if (response.data.downloadTrends) {
      response.data.downloadTrends.forEach((trend: any) => {
        trendsData.push([trend.date, trend.downloads]);
      });
    }

    const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
    XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Download Trends');

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return Excel file
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="analytics-export-${timeRange}-${new Date().toISOString().split('T')[0]}.xlsx"`
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