import { LeadsService } from './LeadsService';
import { TestimonialsService } from './TestimonialsService';
import { ResourcesService } from './ResourcesService';
import type { Analytics } from '@/shared/types/entities';

export class AnalyticsService {
  private leadsService = new LeadsService();
  private testimonialsService = new TestimonialsService();
  private resourcesService = new ResourcesService();

  /**
   * Get comprehensive dashboard analytics
   */
  async getDashboardAnalytics(period: 'week' | 'month' | 'year' = 'month'): Promise<{ data: Analytics; error?: string }> {
    try {
      // Get data from all services
      const [leadsStats, testimonialsStats, resourcesStats] = await Promise.all([
        this.leadsService.getStats(),
        this.testimonialsService.getStats(),
        this.resourcesService.getStats(),
      ]);

      // Calculate conversion rate (no longer calculated since leads don't have status)
      const conversionRate = 0;

      // Calculate monthly leads (mock calculation - in real app would filter by date)
      const leadsThisMonth = Math.round(leadsStats.total * 0.3); // 30% of total for demo

      // Calculate revenue (mock calculation)
      const totalRevenue = 0; // No conversion tracking
      const revenueThisMonth = 0;

      // Get top resources
      const { resources } = await this.resourcesService.getAll({ limit: 5 });
      const topResources = resources
        .sort((a, b) => b.downloadCount - a.downloadCount)
        .slice(0, 5)
        .map(resource => ({
          id: resource.id,
          title: resource.title,
          downloads: resource.downloadCount,
        }));

      // No lead sources since leads don't have source field
      const leadSources: Array<{ source: string; count: number }> = [];

      const analytics: Analytics = {
        totalLeads: leadsStats.total,
        leadsThisMonth,
        conversionRate,
        totalRevenue,
        revenueThisMonth,
        activeUsers: leadsStats.total, // Using total leads as active users
        resourceDownloads: resourcesStats.totalDownloads,
        topResources,
        leadSources,
      };

      return { data: analytics };
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      return { 
        data: {
          totalLeads: 0,
          leadsThisMonth: 0,
          conversionRate: 0,
          totalRevenue: 0,
          revenueThisMonth: 0,
          activeUsers: 0,
          resourceDownloads: 0,
          topResources: [],
          leadSources: [],
        }, 
        error: 'Failed to fetch analytics' 
      };
    }
  }

  /**
   * Get leads analytics with detailed breakdown
   */
  async getLeadsAnalytics(): Promise<{ 
    total: number; 
    error?: string 
  }> {
    try {
      const stats = await this.leadsService.getStats();
      return {
        total: stats.total,
      };
    } catch (error) {
      console.error('Error fetching leads analytics:', error);
      return { 
        total: 0, 
        error: 'Failed to fetch leads analytics' 
      };
    }
  }

  /**
   * Get resources analytics
   */
  async getResourcesAnalytics(): Promise<{ 
    total: number; 
    totalDownloads: number; 
    byCategory: Record<string, number>;
    error?: string 
  }> {
    try {
      const stats = await this.resourcesService.getStats();
      return {
        total: stats.total,
        totalDownloads: stats.totalDownloads,
        byCategory: stats.byCategory,
      };
    } catch (error) {
      console.error('Error fetching resources analytics:', error);
      return { 
        total: 0, 
        totalDownloads: 0, 
        byCategory: {}, 
        error: 'Failed to fetch resources analytics' 
      };
    }
  }

  /**
   * Get testimonials analytics
   */
  async getTestimonialsAnalytics(): Promise<{ 
    total: number; 
    averageRating: number;
    error?: string 
  }> {
    try {
      const stats = await this.testimonialsService.getStats();
      return {
        total: stats.total,
        averageRating: stats.averageRating,
      };
    } catch (error) {
      console.error('Error fetching testimonials analytics:', error);
      return { 
        total: 0, 
        averageRating: 0, 
        error: 'Failed to fetch testimonials analytics' 
      };
    }
  }
} 