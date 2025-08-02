import { NextRequest, NextResponse } from 'next/server';
import { DownloadAnalyticsService } from '@/lib/services/DownloadAnalyticsService';
import { getAuth } from '@/lib/helpers/auth';

export async function POST(request: NextRequest) {
  try {
    const { resourceId, resourceTitle } = await request.json();
    
    if (!resourceId || !resourceTitle) {
      return NextResponse.json(
        { error: 'Resource ID and title are required' },
        { status: 400 }
      );
    }

    // Get user info from auth
    const authResult = await getAuth(request);
    const userId = authResult.user?.uid; // Firebase auth uses uid
    const userEmail = authResult.user?.email;

    // Track the download
    const analyticsService = DownloadAnalyticsService.getInstance();
    const result = await analyticsService.trackDownload(
      resourceId,
      resourceTitle,
      userId,
      userEmail
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to track download' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Download tracked successfully' 
    });

  } catch (error) {
    console.error('Error tracking download:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('resourceId');
    
    if (!resourceId) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }

    // Get download analytics for the resource
    const analyticsService = DownloadAnalyticsService.getInstance();
    const result = await analyticsService.getAnalytics();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to get analytics' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: result.data 
    });

  } catch (error) {
    console.error('Error getting download analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 