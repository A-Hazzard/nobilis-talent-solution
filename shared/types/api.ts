/**
 * API request and response types for the leadership coaching platform
 */

import type { User, Lead, Resource, Testimonial, Analytics } from './entities';

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

// Generic API Response
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}; 