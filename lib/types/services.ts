/**
 * Frontend service types for API interactions
 */

import type { CalendarEvent } from '@/shared/types/entities';
import type { InvoicePreview } from '@/shared/types/payment';
import type { Timestamp } from 'firebase/firestore';

// Email Service Types
export type EmailConfig = {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
};

export type EmailTemplate = {
  subject: string;
  html: string;
  text?: string;
};

export type EmailData = {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
};

export type InvoiceEmailData = {
  invoice: InvoicePreview;
  clientEmail: string;
  clientName: string;
  customMessage?: string;
  pdfAttachment?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  };
};

// Download Analytics Service Types
export type DownloadEvent = {
  id: string;
  resourceId: string;
  resourceTitle: string;
  userId?: string;
  userEmail?: string;
  timestamp: Timestamp;
  userAgent: string;
  ipAddress?: string;
  referrer?: string;
  source?: string;
  campaign?: string;
};

export type DownloadAnalytics = {
  totalDownloads: number;
  downloadsToday: number;
  downloadsThisWeek: number;
  downloadsThisMonth: number;
  popularResources: Array<{
    id: string;
    title: string;
    downloadCount: number;
    category?: string;
    type?: string;
  }>;
  recentDownloads: DownloadEvent[];
  dailyTrends?: Array<{ date: string; downloads: number }>;
  userEngagement?: {
    uniqueUsers: number;
    returningUsers: number;
    averageDownloadsPerUser: number;
    topUsers: Array<{ email: string; downloads: number }>;
  };
};

// Blog Analytics Service Types
export type BlogViewEvent = {
  id: string;
  postId: string;
  postTitle: string;
  userId?: string;
  userEmail?: string;
  timestamp: Timestamp;
  userAgent?: string;
  referrer?: string;
  source?: string;
  campaign?: string;
};

// PDF Service Types
export type PDFOptions = {
  format?: 'A4' | 'Letter';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
};

// Calendly Service Types
export type CalendlyEvent = {
  uri: string;
  name: string;
  status: string;
  start_time: string;
  end_time: string;
  event_type: {
    uri: string;
    name: string;
    active: boolean;
    duration: number;
    kind: string;
    pooling_type: string;
    type: string;
    color: string;
    description_plain: string;
    description_html: string;
    profile: {
      type: string;
      name: string;
      owner: {
        type: string;
        uri: string;
      };
    };
  };
  location: {
    type: string;
    location: string;
  };
  invitee: {
    uri: string;
    name: string;
    email: string;
    timezone: string;
    created_at: string;
    updated_at: string;
    canceled: boolean;
    canceler_name?: string;
    cancel_reason?: string;
    canceled_at?: string;
  };
  created_at: string;
  updated_at: string;
  canceled: boolean;
  canceler_name?: string;
  cancel_reason?: string;
  canceled_at?: string;
  reschedule_url: string;
  rescheduled: boolean;
  old_event?: string;
  old_invitee?: string;
  new_event?: string;
  new_invitee?: string;
};

export type CalendlyScheduledEvent = {
  // Event data at root level (actual API response structure)
  uri: string;
  name: string;
  status: string;
  start_time: string;
  end_time: string;
  event_type: string; // URI to event type
  location: {
    type: string;
    location: string | null;
  };
  invitees_counter: {
    active: number;
    limit: number;
    total: number;
  };
  created_at: string;
  updated_at: string;
  calendar_event?: {
    external_id: string;
    kind: string;
  };
  event_guests: any[];
  event_memberships: any[];
  meeting_notes_html: string | null;
  meeting_notes_plain: string | null;
  
  // Legacy structure for backward compatibility
  event?: CalendlyEvent;
  invitee?: {
    uri: string;
    name: string;
    email: string;
    timezone: string;
    created_at: string;
    updated_at: string;
    canceled: boolean;
    canceler_name?: string;
    cancel_reason?: string;
    canceled_at?: string;
  };
  utm_campaign?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_term?: string;
  utm_content?: string;
  salesforce_uuid?: string;
  old_event?: string;
  old_invitee?: string;
  new_event?: string;
  new_invitee?: string;
};

// Calendar Service Types
export type CreateEventData = {
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  type: CalendarEvent['type'];
  description?: string;
  createdBy: string;
};

export type UpdateEventData = Partial<CreateEventData> & {
  id: string;
};

export type CalendarServiceError = {
  code: string;
  message: string;
};

export type CalendarServiceResponse<T> = {
  data?: T;
  error?: CalendarServiceError;
};

// Auth Service Types
export type UserProfile = {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  organization?: string;
  role: 'admin' | 'user';
  isActive: boolean;
  displayName: string;
  createdAt: Date;
  memberSince?: Date;
  lastLoginAt?: Date;
  updatedAt: Date;
  
  // Authentication provider
  authProvider: 'email' | 'google';
  
  // Email verification
  emailVerified?: boolean;
  emailVerifiedAt?: Date;
  
  // Onboarding fields
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: Date;
  jobTitle?: string;
  organizationType?: 'startup' | 'small-business' | 'enterprise' | 'nonprofit' | 'other';
  industryFocus?: string;
  teamSize?: string;
  primaryGoals?: string[];
  challengesDescription?: string;
  timeline?: string;
  budget?: string;
}; 