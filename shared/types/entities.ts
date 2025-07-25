/**
 * Core entity types for the leadership coaching platform
 */

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  organization?: string;
  role: 'admin' | 'user';
  createdAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
};

export type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  organization?: string;
  createdAt: Date;
  updatedAt: Date;
  // Authentication fields (stored in users collection)
  uid?: string; // Firebase Auth UID
  displayName?: string; // Computed from firstName + lastName
};

export type CalendarEvent = {
  id: string;
  title: string;
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // Time range (e.g., "10:00 AM - 12:00 PM")
  endTime?: string; // End time for the event
  location: string;
  attendees: number;
  type: 'workshop' | 'consultation' | 'training' | 'meeting';
  description?: string;
  createdBy: string; // user ID
  createdAt: Date;
  updatedAt: Date;
  // Calendly integration fields
  calendlyUri?: string; // Calendly event URI
  inviteeEmail?: string; // Calendly invitee email
  inviteeName?: string; // Calendly invitee name
  status?: 'confirmed' | 'canceled' | 'pending'; // Event status
};

export type Resource = {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'docx' | 'image' | 'video' | 'audio' | 'article' | 'whitepaper' | 'template' | 'toolkit';
  category: 'videos' | 'articles' | 'pdfs' | 'whitepapers' | 'leadership' | 'team-building' | 'communication' | 'strategy' | 'other';
  fileUrl: string;
  thumbnailUrl?: string;
  duration?: number; // for videos in seconds
  fileSize?: number; // in bytes
  downloadCount: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // user ID
  tags?: string[]; // Additional tags for better categorization
  featured?: boolean; // Whether this resource should be featured
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string; // URL-friendly version of title
  content: string; // Rich text content
  excerpt: string; // Short description for preview
  featuredImage?: string; // URL to featured image
  author: string; // user ID
  authorName: string; // Display name of author
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  readTime?: number; // Estimated reading time in minutes
  seoTitle?: string;
  seoDescription?: string;
  // Resources and references
  resources?: string[]; // Array of resource IDs from the database
  references?: Array<{
    title: string;
    url: string;
    description?: string;
  }>; // External references/links
};

export type Testimonial = {
  id: string;
  clientName: string;
  company: string;
  content: string;
  rating: number; // 1-5 stars
  isPublic: boolean; // Whether to show on main homepage
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