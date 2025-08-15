import { db } from '@/lib/firebase/config';
import { 
  collection, 
  doc, 
  updateDoc, 
  increment, 
  setDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import type { DownloadEvent, DownloadAnalytics } from '@/lib/types/services';

export class DownloadAnalyticsService {
  private static instance: DownloadAnalyticsService;

  private constructor() {}

  static getInstance(): DownloadAnalyticsService {
    if (!DownloadAnalyticsService.instance) {
      DownloadAnalyticsService.instance = new DownloadAnalyticsService();
    }
    return DownloadAnalyticsService.instance;
  }

  /**
   * Track a download event with enhanced data
   */
  async trackDownload(
    resourceId: string, 
    resourceTitle: string, 
    userId?: string, 
    userEmail?: string,
    additionalData?: {
      ipAddress?: string;
      userAgent?: string;
      referrer?: string;
      source?: string;
      campaign?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Create enhanced download event (omit undefined fields)
      const payload: Record<string, any> = {
        resourceId,
        resourceTitle,
        timestamp: Timestamp.now(),
      };
      if (userId) payload.userId = userId;
      if (userEmail) payload.userEmail = userEmail;
      const ua = additionalData?.userAgent ?? (typeof window !== 'undefined' ? window.navigator.userAgent : '');
      if (ua) payload.userAgent = ua;
      const ip = additionalData?.ipAddress;
      if (ip) payload.ipAddress = ip;
      const ref = additionalData?.referrer ?? (typeof window !== 'undefined' ? document.referrer : '');
      if (ref) payload.referrer = ref;
      if (additionalData?.source) payload.source = additionalData.source;
      if (additionalData?.campaign) payload.campaign = additionalData.campaign;

      // Add to downloads collection
      const downloadsRef = collection(db, 'downloads');
      await setDoc(doc(downloadsRef), payload);

      // Update resource download count and last download timestamp
      const resourceRef = doc(db, 'resources', resourceId);
      await updateDoc(resourceRef, {
        downloadCount: increment(1),
        lastDownloaded: Timestamp.now(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error tracking download:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get comprehensive analytics with time filtering
   */
  async getAnalytics(timeRange: '7d' | '30d' | '90d' = '30d'): Promise<{ success: boolean; data?: DownloadAnalytics; error?: string }> {
    try {
      const now = Timestamp.now();
      let startDate: Timestamp;

      // Calculate start date based on time range
      switch (timeRange) {
        case '7d':
          startDate = new Timestamp(now.seconds - 7 * 24 * 60 * 60, 0);
          break;
        case '30d':
          startDate = new Timestamp(now.seconds - 30 * 24 * 60 * 60, 0);
          break;
        case '90d':
          startDate = new Timestamp(now.seconds - 90 * 24 * 60 * 60, 0);
          break;
        default:
          startDate = new Timestamp(now.seconds - 30 * 24 * 60 * 60, 0);
      }

      const oneDayAgo = new Timestamp(now.seconds - 24 * 60 * 60, 0);
      const oneWeekAgo = new Timestamp(now.seconds - 7 * 24 * 60 * 60, 0);
      const oneMonthAgo = new Timestamp(now.seconds - 30 * 24 * 60 * 60, 0);

      const downloadsRef = collection(db, 'downloads');

      // Get total downloads for the time range (events)
      const totalQuery = query(downloadsRef, where('timestamp', '>=', startDate));
      const totalSnapshot = await getDocs(totalQuery);
      let totalDownloads = totalSnapshot.size;

      // Get downloads today
      const todayQuery = query(downloadsRef, where('timestamp', '>=', oneDayAgo));
      const todaySnapshot = await getDocs(todayQuery);
      const downloadsToday = todaySnapshot.size;

      // Get downloads this week
      const weekQuery = query(downloadsRef, where('timestamp', '>=', oneWeekAgo));
      const weekSnapshot = await getDocs(weekQuery);
      const downloadsThisWeek = weekSnapshot.size;

      // Get downloads this month
      const monthQuery = query(downloadsRef, where('timestamp', '>=', oneMonthAgo));
      const monthSnapshot = await getDocs(monthQuery);
      const downloadsThisMonth = monthSnapshot.size;

      // Get recent downloads
      const recentQuery = query(
        downloadsRef, 
        orderBy('timestamp', 'desc'), 
        limit(20)
      );
      const recentSnapshot = await getDocs(recentQuery);
      const recentDownloads = recentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DownloadEvent[];

      // Get popular resources
      const popularResources = await this.getPopularResources();

      // Fallback: if there are no event logs yet, approximate totals from resource counters
      if (totalDownloads === 0) {
        try {
          const resourcesSnap = await getDocs(collection(db, 'resources'));
          const sum = resourcesSnap.docs.reduce((acc, d) => acc + (d.data().downloadCount || 0), 0);
          totalDownloads = sum;
        } catch {
          // keep 0
        }
      }

      // Get daily download trends
      const dailyTrends = await this.getDailyDownloadTrends(startDate);

      // Get user engagement metrics
      const userEngagement = await this.getUserEngagementMetrics(startDate);

      return {
        success: true,
        data: {
          totalDownloads,
          downloadsToday,
          downloadsThisWeek,
          downloadsThisMonth,
          popularResources,
          recentDownloads,
          dailyTrends,
          userEngagement,
        }
      };
    } catch (error) {
      console.error('Error getting download analytics:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get daily download trends
   */
  private async getDailyDownloadTrends(startDate: Timestamp): Promise<Array<{ date: string; downloads: number }>> {
    try {
      const downloadsRef = collection(db, 'downloads');
      const trendsQuery = query(
        downloadsRef,
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'asc')
      );
      const snapshot = await getDocs(trendsQuery);
      
      const dailyMap = new Map<string, number>();
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const date = data.timestamp.toDate().toISOString().split('T')[0];
        dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
      });

      return Array.from(dailyMap.entries()).map(([date, downloads]) => ({
        date,
        downloads
      })).sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error getting daily trends:', error);
      return [];
    }
  }

  /**
   * Get user engagement metrics
   */
  private async getUserEngagementMetrics(startDate: Timestamp): Promise<{
    uniqueUsers: number;
    returningUsers: number;
    averageDownloadsPerUser: number;
    topUsers: Array<{ email: string; downloads: number }>;
  }> {
    try {
      const downloadsRef = collection(db, 'downloads');
      const engagementQuery = query(
        downloadsRef,
        where('timestamp', '>=', startDate)
      );
      const snapshot = await getDocs(engagementQuery);
      
      const userMap = new Map<string, number>();
      const uniqueUsers = new Set<string>();
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.userEmail) {
          uniqueUsers.add(data.userEmail);
          userMap.set(data.userEmail, (userMap.get(data.userEmail) || 0) + 1);
        }
      });

      const topUsers = Array.from(userMap.entries())
        .map(([email, downloads]) => ({ email, downloads }))
        .sort((a, b) => b.downloads - a.downloads)
        .slice(0, 10);

      const totalDownloads = snapshot.size;
      const averageDownloadsPerUser = uniqueUsers.size > 0 ? totalDownloads / uniqueUsers.size : 0;

      // Calculate returning users (users with more than 1 download)
      const returningUsers = Array.from(userMap.values()).filter(count => count > 1).length;

      return {
        uniqueUsers: uniqueUsers.size,
        returningUsers,
        averageDownloadsPerUser: Math.round(averageDownloadsPerUser * 100) / 100,
        topUsers,
      };
    } catch (error) {
      console.error('Error getting user engagement:', error);
      return {
        uniqueUsers: 0,
        returningUsers: 0,
        averageDownloadsPerUser: 0,
        topUsers: [],
      };
    }
  }

  /**
   * Get popular resources with enhanced data
   */
  private async getPopularResources(): Promise<Array<{ id: string; title: string; downloadCount: number; category?: string; type?: string }>> {
    try {
      const resourcesRef = collection(db, 'resources');
      const popularQuery = query(
        resourcesRef,
        orderBy('downloadCount', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(popularQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        downloadCount: doc.data().downloadCount || 0,
        category: doc.data().category,
        type: doc.data().type,
      }));
    } catch (error) {
      console.error('Error getting popular resources:', error);
      return [];
    }
  }

  /**
   * Get related resources based on tags and category with analytics
   */
  async getRelatedResources(
    currentResourceId: string
  ): Promise<Array<{ id: string; title: string; type: string; description: string; downloadCount: number }>> {
    try {
      const resourcesRef = collection(db, 'resources');
      
      // Get current resource to find related ones
      const currentResourceDoc = await getDocs(query(resourcesRef, where('id', '==', currentResourceId)));
      if (currentResourceDoc.empty) return [];

      const currentResource = currentResourceDoc.docs[0].data();
      
      // Query for resources with similar category, excluding current resource
      const relatedQuery = query(
        resourcesRef,
        where('category', '==', currentResource.category),
        orderBy('downloadCount', 'desc'),
        limit(5)
      );
      
      const snapshot = await getDocs(relatedQuery);
      
      return snapshot.docs
        .filter(doc => doc.id !== currentResourceId)
        .map(doc => ({
          id: doc.id,
          title: doc.data().title,
          type: doc.data().type,
          description: doc.data().description,
          downloadCount: doc.data().downloadCount || 0,
        }));
    } catch (error) {
      console.error('Error getting related resources:', error);
      return [];
    }
  }

  /**
   * Get download history for a user with enhanced data
   */
  async getUserDownloadHistory(userId: string, limitCount: number = 20): Promise<DownloadEvent[]> {
    try {
      const downloadsRef = collection(db, 'downloads');
      const userQuery = query(
        downloadsRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(userQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DownloadEvent[];
    } catch (error) {
      console.error('Error getting user download history:', error);
      return [];
    }
  }

  /**
   * Get resource performance analytics
   */
  async getResourcePerformance(resourceId: string): Promise<{
    totalDownloads: number;
    downloadsThisWeek: number;
    downloadsThisMonth: number;
    averageDownloadsPerDay: number;
    downloadTrend: 'increasing' | 'decreasing' | 'stable';
    topReferrers: Array<{ referrer: string; count: number }>;
  }> {
    try {
      const downloadsRef = collection(db, 'downloads');
      const now = Timestamp.now();
      const oneWeekAgo = new Timestamp(now.seconds - 7 * 24 * 60 * 60, 0);
      const oneMonthAgo = new Timestamp(now.seconds - 30 * 24 * 60 * 60, 0);

      // Get all downloads for this resource
      const allDownloadsQuery = query(downloadsRef, where('resourceId', '==', resourceId));
      const allSnapshot = await getDocs(allDownloadsQuery);
      const totalDownloads = allSnapshot.size;

      // Get downloads this week
      const weekQuery = query(
        downloadsRef,
        where('resourceId', '==', resourceId),
        where('timestamp', '>=', oneWeekAgo)
      );
      const weekSnapshot = await getDocs(weekQuery);
      const downloadsThisWeek = weekSnapshot.size;

      // Get downloads this month
      const monthQuery = query(
        downloadsRef,
        where('resourceId', '==', resourceId),
        where('timestamp', '>=', oneMonthAgo)
      );
      const monthSnapshot = await getDocs(monthQuery);
      const downloadsThisMonth = monthSnapshot.size;

      // Calculate average downloads per day
      const averageDownloadsPerDay = totalDownloads > 0 ? totalDownloads / 30 : 0;

      // Analyze download trend
      const recentDownloads = weekSnapshot.size;
      const previousWeekDownloads = totalDownloads - monthSnapshot.size + weekSnapshot.size;
      let downloadTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      
      if (recentDownloads > previousWeekDownloads * 1.1) {
        downloadTrend = 'increasing';
      } else if (recentDownloads < previousWeekDownloads * 0.9) {
        downloadTrend = 'decreasing';
      }

      // Get top referrers
      const referrerMap = new Map<string, number>();
      allSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.referrer) {
          referrerMap.set(data.referrer, (referrerMap.get(data.referrer) || 0) + 1);
        }
      });

      const topReferrers = Array.from(referrerMap.entries())
        .map(([referrer, count]) => ({ referrer, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalDownloads,
        downloadsThisWeek,
        downloadsThisMonth,
        averageDownloadsPerDay: Math.round(averageDownloadsPerDay * 100) / 100,
        downloadTrend,
        topReferrers,
      };
    } catch (error) {
      console.error('Error getting resource performance:', error);
      return {
        totalDownloads: 0,
        downloadsThisWeek: 0,
        downloadsThisMonth: 0,
        averageDownloadsPerDay: 0,
        downloadTrend: 'stable',
        topReferrers: [],
      };
    }
  }

  /**
   * Get analytics export data
   */
  async getAnalyticsExport(timeRange: '7d' | '30d' | '90d' = '30d'): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const analytics = await this.getAnalytics(timeRange);
      if (!analytics.success || !analytics.data) {
        return { success: false, error: 'Failed to get analytics data' };
      }

      const exportData = {
        generatedAt: new Date().toISOString(),
        timeRange,
        summary: {
          totalDownloads: analytics.data.totalDownloads,
          downloadsToday: analytics.data.downloadsToday,
          downloadsThisWeek: analytics.data.downloadsThisWeek,
          downloadsThisMonth: analytics.data.downloadsThisMonth,
        },
        popularResources: analytics.data.popularResources,
        recentDownloads: analytics.data.recentDownloads,
        dailyTrends: analytics.data.dailyTrends,
        userEngagement: analytics.data.userEngagement,
      };

      return { success: true, data: exportData };
    } catch (error) {
      console.error('Error exporting analytics:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
} 