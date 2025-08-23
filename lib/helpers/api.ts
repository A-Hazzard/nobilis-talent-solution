/**
 * API helper functions for the leadership coaching platform
 */

import type { ApiResponse } from '@/shared/types/api';
import type { Lead, Resource, Testimonial, Analytics } from '@/shared/types/entities';
import type { PaginationParams, FilterParams } from '@/shared/types/common';

const API_BASE = '/api';

/**
 * Generic API request function with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Leads API functions
 */
export const leadsApi = {
  async getAll(params: PaginationParams & FilterParams) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    
    return apiRequest<{ leads: Lead[]; total: number; page: number; limit: number }>(
      `/leads?${searchParams.toString()}`
    );
  },

  async getById(id: string) {
    return apiRequest<Lead>(`/leads/${id}`);
  },

  async create(data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) {
    return apiRequest<Lead>('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<Lead>) {
    return apiRequest<Lead>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return apiRequest<void>(`/leads/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Resources API functions
 */
export const resourcesApi = {
  async getResources(params: Partial<PaginationParams & FilterParams> = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    
    return apiRequest<{ resources: Resource[]; total: number; page: number; limit: number }>(
      `/resources?${searchParams.toString()}`
    );
  },

  async getAll(params: PaginationParams & FilterParams) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    
    return apiRequest<{ resources: Resource[]; total: number; page: number; limit: number }>(
      `/resources?${searchParams.toString()}`
    );
  },

  async getById(id: string) {
    return apiRequest<Resource>(`/resources/${id}`);
  },

  async create(formData: FormData) {
    return apiRequest<Resource>('/resources', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  },

  async update(id: string, data: Partial<Resource>) {
    return apiRequest<Resource>(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return apiRequest<void>(`/resources/${id}`, {
      method: 'DELETE',
    });
  },

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiRequest<{ url: string; filename: string; size: number }>('/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  },
};

/**
 * Testimonials API functions
 */
export const testimonialsApi = {
  async getTestimonials(params: Partial<PaginationParams & FilterParams> = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    
    return apiRequest<{ testimonials: Testimonial[]; total: number; page: number; limit: number }>(
      `/testimonials?${searchParams.toString()}`
    );
  },

  async getAll(params: PaginationParams & FilterParams) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    
    return apiRequest<{ testimonials: Testimonial[]; total: number; page: number; limit: number }>(
      `/testimonials?${searchParams.toString()}`
    );
  },

  async getById(id: string) {
    return apiRequest<Testimonial>(`/testimonials/${id}`);
  },

  async create(data: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>) {
    return apiRequest<Testimonial>('/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<Testimonial>) {
    return apiRequest<Testimonial>(`/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return apiRequest<void>(`/testimonials/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Analytics API functions
 */
export const analyticsApi = {
  async getDashboard(period: 'week' | 'month' | 'year' = 'month') {
    return apiRequest<{ analytics: Analytics; period: 'week' | 'month' | 'year' }>(`/analytics/dashboard?period=${period}`);
  },

  async getLeadSources() {
    return apiRequest<Array<{ source: string; count: number }>>('/analytics/lead-sources');
  },

  async getTopResources() {
    return apiRequest<Array<{ id: string; title: string; downloads: number }>>('/analytics/top-resources');
  },
}; 