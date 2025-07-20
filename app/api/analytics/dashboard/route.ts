import { NextRequest, NextResponse } from 'next/server';
import { LeadsService } from '@/lib/services/LeadsService';
import { ResourcesService } from '@/lib/services/ResourcesService';
import { TestimonialsService } from '@/lib/services/TestimonialsService';
import type { AnalyticsResponse } from '@/shared/types/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as 'week' | 'month' | 'year' || 'month';

    // Get real data from services
    const leadsService = new LeadsService();
    const resourcesService = new ResourcesService();
    const testimonialsService = new TestimonialsService();

    // Get leads data
    const { leads: allLeads, total: totalLeads } = await leadsService.getAll({ page: 1, limit: 1000 });
    
    // Get resources data
    const { resources: allResources } = await resourcesService.getAll({ limit: 1000 });
    
    // Get testimonials data
    const { testimonials: allTestimonials } = await testimonialsService.getAll({ limit: 1000 });

    // Calculate analytics from real data
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const leadsThisMonth = allLeads.filter(lead => 
      new Date(lead.createdAt) >= thisMonth
    ).length;

    const totalResources = allResources.length;
    const totalTestimonials = allTestimonials.length;

    const topResources = allResources
      .sort((a, b) => b.downloadCount - a.downloadCount)
      .slice(0, 5)
      .map(resource => ({
        id: resource.id,
        title: resource.title,
        downloads: resource.downloadCount
      }));

    const recentLeads = allLeads
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const analytics = {
      totalLeads,
      leadsThisMonth,
      conversionRate: 0, // Conversion rate is no longer calculated
      totalRevenue: 0, // TODO: Implement revenue tracking
      revenueThisMonth: 0, // TODO: Implement revenue tracking
      activeUsers: totalLeads, // Using total leads as active users for now
      resourceDownloads: allResources.reduce((sum, resource) => sum + resource.downloadCount, 0),
      topResources,
      leadSources: [], // Lead sources are no longer calculated
    };

    const response: AnalyticsResponse = {
      analytics,
      period,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 