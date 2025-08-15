import { db } from '@/lib/firebase/config';
import { collection, doc, setDoc, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import type { BlogViewEvent } from '@/lib/types/services';

export class BlogAnalyticsService {
  private static instance: BlogAnalyticsService;

  private constructor() {}

  static getInstance(): BlogAnalyticsService {
    if (!BlogAnalyticsService.instance) {
      BlogAnalyticsService.instance = new BlogAnalyticsService();
    }
    return BlogAnalyticsService.instance;
  }

  async trackView(
    postId: string,
    postTitle: string,
    userId?: string,
    userEmail?: string,
    additionalData?: {
      userAgent?: string;
      referrer?: string;
      source?: string;
      campaign?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const payload: Record<string, any> = {
        postId,
        postTitle,
        timestamp: Timestamp.now(),
      };
      if (userId) payload.userId = userId;
      if (userEmail) payload.userEmail = userEmail;
      const ua = additionalData?.userAgent ?? (typeof window !== 'undefined' ? window.navigator.userAgent : '');
      if (ua) payload.userAgent = ua;
      const ref = additionalData?.referrer ?? (typeof window !== 'undefined' ? document.referrer : '');
      if (ref) payload.referrer = ref;
      if (additionalData?.source) payload.source = additionalData.source;
      if (additionalData?.campaign) payload.campaign = additionalData.campaign;

      const viewsRef = collection(db, 'blogViews');
      await setDoc(doc(viewsRef), payload);
      return { success: true };
    } catch (error) {
      console.error('Error tracking blog view:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getRecentViews(max: number = 20): Promise<BlogViewEvent[]> {
    try {
      const viewsRef = collection(db, 'blogViews');
      const q = query(viewsRef, orderBy('timestamp', 'desc'), limit(max));
      const snap = await getDocs(q);
      const items: BlogViewEvent[] = [];
      snap.forEach((d) => {
        const data: any = d.data();
        items.push({
          id: d.id,
          postId: data.postId,
          postTitle: data.postTitle,
          userId: data.userId,
          userEmail: data.userEmail,
          timestamp: data.timestamp,
          userAgent: data.userAgent,
          referrer: data.referrer,
          source: data.source,
          campaign: data.campaign,
        });
      });
      return items;
    } catch (error) {
      console.error('Error loading recent blog views:', error);
      return [];
    }
  }
}



