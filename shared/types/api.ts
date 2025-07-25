/**
 * API request and response types for the leadership coaching platform
 */

import type { User, Lead, Resource, Testimonial, Analytics } from './entities';
import type { AuditLog } from './audit';

// Authentication
export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: User;
  token: string;
};

export type AuthResponse = {
  user: User;
  isAuthenticated: boolean;
};

// Leads
export type CreateLeadRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  organization?: string;
  phone?: string;
};

export type UpdateLeadRequest = Partial<Omit<CreateLeadRequest, 'password' | 'confirmPassword'>>;

export type LeadsResponse = {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
};

// Resources
export type CreateResourceRequest = {
  title: string;
  description: string;
  type: Resource['type'];
  category: Resource['category'];
  file: File;
  thumbnail?: File;
  isPublic: boolean;
};

export type UpdateResourceRequest = Partial<Omit<CreateResourceRequest, 'file' | 'thumbnail'>>;

export type ResourcesResponse = {
  resources: Resource[];
  total: number;
  page: number;
  limit: number;
};

// Testimonials
export type CreateTestimonialRequest = {
  clientName: string;
  company: string;
  content: string;
  rating: number;
  isPublic: boolean;
};

export type UpdateTestimonialRequest = Partial<CreateTestimonialRequest>;

export type TestimonialsResponse = {
  testimonials: Testimonial[];
  total: number;
  page: number;
  limit: number;
};

// Analytics
export type AnalyticsResponse = {
  analytics: Analytics;
  period: 'week' | 'month' | 'year';
};

// File Upload
export type FileUploadResponse = {
  url: string;
  filename: string;
  size: number;
};

// Resource API Types
export type GetResourcesRequest = {
  category?: string;
  type?: string;
  search?: string;
  limit?: number;
  featured?: boolean;
};

export type GetResourcesResponse = {
  resources: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    category: string;
    fileUrl: string;
    thumbnailUrl?: string;
    downloadCount: number;
    createdAt: string;
    tags?: string[];
    featured?: boolean;
  }>;
  total: number;
  error?: string;
};

export type DownloadResourceRequest = {
  resourceId: string;
};

export type DownloadResourceResponse = {
  success: boolean;
  downloadUrl?: string;
  error?: string;
};

// Blog API Types
export type GetBlogPostsRequest = {
  category?: string;
  tag?: string;
  search?: string;
  limit?: number;
  status?: 'published' | 'draft' | 'archived';
};

export type GetBlogPostsResponse = {
  posts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage?: string;
    authorName: string;
    category: string;
    tags: string[];
    publishedAt: string;
    viewCount: number;
    readTime?: number;
  }>;
  total: number;
  error?: string;
};

export type GetBlogPostRequest = {
  slug: string;
};

export type GetBlogPostResponse = {
  post?: {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featuredImage?: string;
    authorName: string;
    category: string;
    tags: string[];
    publishedAt: string;
    viewCount: number;
    readTime?: number;
    seoTitle?: string;
    seoDescription?: string;
  };
  error?: string;
};



export type CreateBlogPostRequest = {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type UpdateBlogPostRequest = Partial<CreateBlogPostRequest>;

// Common API Response
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type CreateAuditLogRequest = Omit<AuditLog, 'id' | 'createdAt'>;

export type AuditLogsResponse = {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
};

export type RecentActivityResponse = {
  activities: Array<{
    action: string;
    time: string;
    entityType: string;
    entityTitle?: string;
  }>;
}; 