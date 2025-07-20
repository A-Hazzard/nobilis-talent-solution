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
  type: 'pdf' | 'docx' | 'image' | 'video' | 'audio';
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