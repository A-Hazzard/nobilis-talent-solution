import { NextRequest, NextResponse } from 'next/server';
import { AuditService } from '@/lib/services/AuditService';
import { formatTimeAgo } from '@/lib/utils/auditUtils';
import type { RecentActivityResponse } from '@/shared/types/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    const auditService = AuditService.getInstance();
    const recentLogs = await auditService.getRecentActivity(limit);

    const activities = recentLogs.map(log => ({
      action: `${log.action} ${log.entity}: ${log.details?.title || log.entityId}`,
      time: formatTimeAgo(new Date(log.timestamp)),
      entityType: log.entity,
      entityTitle: log.details?.title || log.entityId,
    }));

    const response: RecentActivityResponse = {
      activities,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Recent activity API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 