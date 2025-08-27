import {
  leadsApi,
  resourcesApi,
  testimonialsApi,
  analyticsApi
} from '@/lib/helpers/api';

// Mock fetch
global.fetch = jest.fn();

describe('API Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('leadsApi', () => {
    it('should get all leads', async () => {
      const mockResponse = {
        success: true,
        leads: [{ id: '1', name: 'Test Lead' }],
        total: 1,
        page: 1,
        limit: 10
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await leadsApi.getAll({ page: 1, limit: 10 });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/leads?page=1&limit=10', expect.any(Object));
    });

    it('should get lead by id', async () => {
      const mockResponse = {
        success: true,
        id: '1',
        name: 'Test Lead'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await leadsApi.getById('1');

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/leads/1', expect.any(Object));
    });

    it('should create a lead', async () => {
      const mockResponse = {
        success: true,
        id: '1',
        name: 'New Lead'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await leadsApi.create({ name: 'New Lead' });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/leads', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'New Lead' })
      }));
    });

    it('should update a lead', async () => {
      const mockResponse = {
        success: true,
        id: '1',
        name: 'Updated Lead'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await leadsApi.update('1', { name: 'Updated Lead' });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/leads/1', expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Lead' })
      }));
    });

    it('should delete a lead', async () => {
      const mockResponse = { success: true };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await leadsApi.delete('1');

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/leads/1', expect.objectContaining({
        method: 'DELETE'
      }));
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        success: false,
        error: 'Not found'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => mockResponse
      });

      const result = await leadsApi.getById('999');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('resourcesApi', () => {
    it('should get all resources', async () => {
      const mockResponse = {
        success: true,
        resources: [{ id: '1', title: 'Test Resource' }],
        total: 1,
        page: 1,
        limit: 10
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await resourcesApi.getAll({ page: 1, limit: 10 });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/resources?page=1&limit=10', expect.any(Object));
    });

    it('should get resources with getResources method', async () => {
      const mockResponse = {
        success: true,
        resources: [{ id: '1', title: 'Test Resource' }],
        total: 1,
        page: 1,
        limit: 10
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await resourcesApi.getResources({ page: 1, limit: 10 });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/resources?page=1&limit=10', expect.any(Object));
    });

    it('should get resource by id', async () => {
      const mockResponse = {
        success: true,
        id: '1',
        title: 'Test Resource'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await resourcesApi.getById('1');

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/resources/1', expect.any(Object));
    });

    it('should create a resource', async () => {
      const mockResponse = {
        success: true,
        id: '1',
        title: 'New Resource'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const formData = new FormData();
      formData.append('title', 'New Resource');

      const result = await resourcesApi.create(formData);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/resources', expect.objectContaining({
        method: 'POST',
        body: formData
      }));
    });

    it('should update a resource', async () => {
      const mockResponse = {
        success: true,
        id: '1',
        title: 'Updated Resource'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await resourcesApi.update('1', { title: 'Updated Resource' });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/resources/1', expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated Resource' })
      }));
    });

    it('should delete a resource', async () => {
      const mockResponse = { success: true };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await resourcesApi.delete('1');

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/resources/1', expect.objectContaining({
        method: 'DELETE'
      }));
    });

    it('should upload a file', async () => {
      const mockResponse = {
        success: true,
        url: 'https://example.com/file.pdf',
        filename: 'file.pdf',
        size: 1024
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const result = await resourcesApi.uploadFile(file);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/upload', expect.objectContaining({
        method: 'POST'
      }));
    });
  });

  describe('testimonialsApi', () => {
    it('should get all testimonials', async () => {
      const mockResponse = {
        success: true,
        testimonials: [{ id: '1', content: 'Test Testimonial' }],
        total: 1,
        page: 1,
        limit: 10
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await testimonialsApi.getAll({ page: 1, limit: 10 });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/testimonials?page=1&limit=10', expect.any(Object));
    });

    it('should get testimonials with getTestimonials method', async () => {
      const mockResponse = {
        success: true,
        testimonials: [{ id: '1', content: 'Test Testimonial' }],
        total: 1,
        page: 1,
        limit: 10
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await testimonialsApi.getTestimonials({ page: 1, limit: 10 });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/testimonials?page=1&limit=10', expect.any(Object));
    });

    it('should get testimonial by id', async () => {
      const mockResponse = {
        success: true,
        id: '1',
        content: 'Test Testimonial'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await testimonialsApi.getById('1');

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/testimonials/1', expect.any(Object));
    });

    it('should create a testimonial', async () => {
      const mockResponse = {
        success: true,
        id: '1',
        content: 'New Testimonial'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await testimonialsApi.create({ content: 'New Testimonial' });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/testimonials', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ content: 'New Testimonial' })
      }));
    });

    it('should update a testimonial', async () => {
      const mockResponse = {
        success: true,
        id: '1',
        content: 'Updated Testimonial'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await testimonialsApi.update('1', { content: 'Updated Testimonial' });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/testimonials/1', expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ content: 'Updated Testimonial' })
      }));
    });

    it('should delete a testimonial', async () => {
      const mockResponse = { success: true };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await testimonialsApi.delete('1');

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/testimonials/1', expect.objectContaining({
        method: 'DELETE'
      }));
    });
  });

  describe('analyticsApi', () => {
    it('should get dashboard analytics', async () => {
      const mockResponse = {
        success: true,
        analytics: { totalLeads: 100, totalResources: 50 },
        period: 'month'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await analyticsApi.getDashboard('month');

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/analytics/dashboard?period=month', expect.any(Object));
    });

    it('should get lead sources', async () => {
      const mockResponse = {
        success: true,
        data: [{ source: 'Website', count: 50 }]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await analyticsApi.getLeadSources();

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/analytics/lead-sources', expect.any(Object));
    });

    it('should get top resources', async () => {
      const mockResponse = {
        success: true,
        data: [{ id: '1', title: 'Top Resource', downloads: 100 }]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await analyticsApi.getTopResources();

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/analytics/top-resources', expect.any(Object));
    });
  });
});
