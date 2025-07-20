/**
 * Core entity types for the leadership coaching platform
 */

export type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  challenges: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: 'website' | 'referral' | 'social' | 'other';
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  demoScheduled?: Date;
  paymentStatus?: 'pending' | 'completed' | 'failed';
};

export type Resource = {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'pdf' | 'whitepaper';
  category: 'leadership' | 'team-building' | 'communication' | 'strategy' | 'other';
  fileUrl: string;
  thumbnailUrl?: string;
  duration?: number; // for videos in seconds
  fileSize?: number; // in bytes
  downloadCount: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // user ID
};

export type Testimonial = {
  id: string;
  clientName: string;
  company: string;
  content: string;
  rating: number; // 1-5 stars
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Analytics = {
  totalLeads: number;
  leadsThisMonth: number;
  conversionRate: number;
  totalRevenue: number;
  revenueThisMonth: number;
  activeUsers: number;
  resourceDownloads: number;
  topResources: Array<{
    id: string;
    title: string;
    downloads: number;
  }>;
  leadSources: Array<{
    source: string;
    count: number;
  }>;
}; 