import { AnalyticsService } from '@/lib/services/AnalyticsService';
import { LeadsService } from '@/lib/services/LeadsService';
import { TestimonialsService } from '@/lib/services/TestimonialsService';
import { ResourcesService } from '@/lib/services/ResourcesService';

// Mock the service dependencies
jest.mock('@/lib/services/LeadsService');
jest.mock('@/lib/services/TestimonialsService');
jest.mock('@/lib/services/ResourcesService');

// Mock fetch
global.fetch = jest.fn();

const mockLeadsService = {
  getStats: jest.fn(),
};

const mockTestimonialsService = {
  getStats: jest.fn(),
};

const mockResourcesService = {
  getStats: jest.fn(),
  getAll: jest.fn(),
};

// Mock the service constructors to return our mocks
(LeadsService as jest.MockedClass<typeof LeadsService>).mockImplementation(() => mockLeadsService as any);
(TestimonialsService.getInstance as jest.MockedFunction<typeof TestimonialsService.getInstance>).mockReturnValue(mockTestimonialsService as any);
(ResourcesService as jest.MockedClass<typeof ResourcesService>).mockImplementation(() => mockResourcesService as any);

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    jest.clearAllMocks();
    analyticsService = new AnalyticsService();
  });

  describe('getDashboardAnalytics', () => {
    const mockLeadsStats = { total: 100, error: undefined };
    const mockTestimonialsStats = { total: 50, error: undefined };
    const mockResourcesStats = { totalDownloads: 200, error: undefined };
    const mockResources = {
      resources: [
        { id: '1', title: 'Resource 1', downloadCount: 150 },
        { id: '2', title: 'Resource 2', downloadCount: 100 },
        { id: '3', title: 'Resource 3', downloadCount: 50 },
      ],
      error: undefined,
    };

    beforeEach(() => {
      mockLeadsService.getStats.mockResolvedValue(mockLeadsStats);
      mockTestimonialsService.getStats.mockResolvedValue(mockTestimonialsStats);
      mockResourcesService.getStats.mockResolvedValue(mockResourcesStats);
      mockResourcesService.getAll.mockResolvedValue(mockResources);
    });

    it('should return server analytics when API is successful', async () => {
      const mockServerAnalytics = {
        totalLeads: 120,
        leadsThisMonth: 25,
        totalRevenue: 50000,
        revenueThisMonth: 5000,
        totalBonuses: 1000,
        bonusesThisMonth: 200,
        totalInvoices: 10,
        activeUsers: 80,
        resourceDownloads: 300,
        topResources: [],
        leadSources: [],
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { analytics: mockServerAnalytics },
        }),
      } as Response);

      const result = await analyticsService.getDashboardAnalytics();

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual(mockServerAnalytics);
      expect(fetch).toHaveBeenCalledWith('/api/analytics/dashboard?period=month', { cache: 'no-store' });
    });

    it('should fall back to client aggregation when API fails', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('API error'));

      const result = await analyticsService.getDashboardAnalytics();

      expect(result.error).toBeUndefined();
      expect(result.data.totalLeads).toBe(100);
      expect(result.data.leadsThisMonth).toBe(30); // 30% of 100
      expect(result.data.resourceDownloads).toBe(200);
      expect(result.data.topResources).toHaveLength(3);
      expect(result.data.topResources[0].title).toBe('Resource 1');
      expect(result.data.topResources[0].downloads).toBe(150);
    });

    it('should calculate different periods correctly', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('API error'));

      // Test weekly period
      const weeklyResult = await analyticsService.getDashboardAnalytics('week');
      expect(weeklyResult.data.leadsThisMonth).toBe(8); // 7.5% of 100, rounded

      // Test yearly period
      const yearlyResult = await analyticsService.getDashboardAnalytics('year');
      expect(yearlyResult.data.leadsThisMonth).toBe(90); // 90% of 100
    });

    it('should handle service errors gracefully', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('API error'));
      mockLeadsService.getStats.mockRejectedValue(new Error('Leads service error'));

      const result = await analyticsService.getDashboardAnalytics();

      expect(result.error).toBe('Failed to fetch analytics');
      expect(result.data.totalLeads).toBe(0);
      expect(result.data.leadsThisMonth).toBe(0);
    });

    it('should sort resources by download count', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('API error'));
      
      const unsortedResources = {
        resources: [
          { id: '1', title: 'Resource 1', downloadCount: 50 },
          { id: '2', title: 'Resource 2', downloadCount: 150 },
          { id: '3', title: 'Resource 3', downloadCount: 100 },
        ],
        error: undefined,
      };
      
      mockResourcesService.getAll.mockResolvedValue(unsortedResources);

      const result = await analyticsService.getDashboardAnalytics();

      expect(result.data.topResources[0].downloads).toBe(150);
      expect(result.data.topResources[1].downloads).toBe(100);
      expect(result.data.topResources[2].downloads).toBe(50);
    });

    it('should handle API response with missing data', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: false,
        }),
      } as Response);

      const result = await analyticsService.getDashboardAnalytics();

      // Should fall back to client aggregation
      expect(result.error).toBeUndefined();
      expect(result.data.totalLeads).toBe(100);
    });

    it('should handle API response that is not ok', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const result = await analyticsService.getDashboardAnalytics();

      // Should fall back to client aggregation
      expect(result.error).toBeUndefined();
      expect(result.data.totalLeads).toBe(100);
    });
  });


});
