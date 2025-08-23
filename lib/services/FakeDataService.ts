import type { Analytics } from '@/shared/types/entities';

export class FakeDataService {
  private static instance: FakeDataService;

  private constructor() {}

  static getInstance(): FakeDataService {
    if (!FakeDataService.instance) {
      FakeDataService.instance = new FakeDataService();
    }
    return FakeDataService.instance;
  }

  /**
   * Generate fake analytics data for the dashboard
   */
  generateFakeAnalytics(): Analytics {
    const totalLeads = this.getRandomNumber(150, 500);
    const leadsThisMonth = this.getRandomNumber(20, 80);
    const totalRevenue = this.getRandomNumber(50000, 200000);
    const revenueThisMonth = this.getRandomNumber(5000, 25000);
    const totalBonuses = this.getRandomNumber(5000, 25000);
    const bonusesThisMonth = this.getRandomNumber(500, 5000);
    const totalInvoices = this.getRandomNumber(50, 200);
    const activeUsers = this.getRandomNumber(50, 200);
    const resourceDownloads = this.getRandomNumber(300, 1200);

    return {
      totalLeads,
      leadsThisMonth,
      totalRevenue,
      revenueThisMonth,
      totalBonuses,
      bonusesThisMonth,
      totalInvoices,
      activeUsers,
      resourceDownloads,
      topResources: this.generateFakeTopResources(),
      leadSources: this.generateFakeLeadSources(),
    };
  }

  /**
   * Generate fake top resources data
   */
  private generateFakeTopResources() {
    const resourceNames = [
      'Leadership Fundamentals Guide',
      'Team Building Workshop Materials',
      'Communication Skills PDF',
      'Strategic Planning Template',
      'Conflict Resolution Handbook',
      'Performance Management Guide',
      'Change Management Toolkit',
      'Employee Engagement Survey',
    ];

    return resourceNames.slice(0, 5).map((name, index) => ({
      id: `resource-${index + 1}`,
      title: name,
      downloads: this.getRandomNumber(50, 300),
    }));
  }

  /**
   * Generate fake lead sources data
   */
  private generateFakeLeadSources() {
    const sources = [
      { source: 'Website', count: this.getRandomNumber(40, 120) },
      { source: 'LinkedIn', count: this.getRandomNumber(20, 80) },
      { source: 'Referral', count: this.getRandomNumber(15, 60) },
      { source: 'Email Campaign', count: this.getRandomNumber(10, 50) },
      { source: 'Social Media', count: this.getRandomNumber(8, 40) },
      { source: 'Conference', count: this.getRandomNumber(5, 25) },
    ];

    return sources.sort((a, b) => b.count - a.count);
  }

  /**
   * Generate fake stats data
   */
  generateFakeStats() {
    const totalLeads = this.getRandomNumber(150, 500);
    const newLeads = this.getRandomNumber(20, 80);
    const conversionRate = this.getRandomNumber(15, 35);
    const avgResponseTime = this.getRandomNumber(1, 5);
    const totalRevenue = this.getRandomNumber(50000, 200000);
    const resourceDownloads = this.getRandomNumber(300, 1200);

    return {
      totalLeads,
      newLeads,
      conversionRate,
      avgResponseTime,
      totalRevenue,
      resourceDownloads,
    };
  }

  /**
   * Generate fake chart data
   */
  generateFakeChartData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      leads: months.map(() => this.getRandomNumber(10, 50)),
      revenue: months.map(() => this.getRandomNumber(5000, 25000)),
      downloads: months.map(() => this.getRandomNumber(20, 100)),
      months,
    };
  }

  /**
   * Generate fake chart data for dashboard charts
   */
  generateFakeDashboardChartData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return {
      leadsByMonth: {
        labels: months,
        data: months.map(() => this.getRandomNumber(15, 80)),
      },
      revenueOverview: {
        labels: ['Total Revenue', 'Paid Invoices', 'Total Bonuses'],
        data: [
          this.getRandomNumber(50000, 200000),
          this.getRandomNumber(30000, 150000),
          this.getRandomNumber(5000, 25000),
        ],
      },
      leadsBySource: {
        labels: ['Website', 'LinkedIn', 'Referral', 'Email Campaign', 'Social Media'],
        data: [
          this.getRandomNumber(30, 80),
          this.getRandomNumber(20, 60),
          this.getRandomNumber(15, 45),
          this.getRandomNumber(10, 35),
          this.getRandomNumber(5, 25),
        ],
      },
    };
  }

  /**
   * Generate fake recent activity
   */
  generateFakeRecentActivity() {
    const activities = [
      { 
        action: 'create', 
        entity: 'lead', 
        entityId: 'lead-001', 
        entityTitle: 'John Smith - Marketing Director',
        time: '2 min ago',
        userEmail: 'admin@example.com',
        timestamp: Date.now() - 120000
      },
      { 
        action: 'update', 
        entity: 'resource', 
        entityId: 'resource-005', 
        entityTitle: 'Leadership Fundamentals Guide',
        time: '1 hour ago',
        userEmail: 'admin@example.com',
        timestamp: Date.now() - 3600000
      },
      { 
        action: 'create', 
        entity: 'testimonial', 
        entityId: 'testimonial-003', 
        entityTitle: 'Sarah Johnson - CEO',
        time: '3 hours ago',
        userEmail: 'admin@example.com',
        timestamp: Date.now() - 10800000
      },
      { 
        action: 'login', 
        entity: 'auth', 
        entityId: 'session-001', 
        entityTitle: 'Admin Login',
        time: '5 hours ago',
        userEmail: 'admin@example.com',
        timestamp: Date.now() - 18000000
      },
      { 
        action: 'delete', 
        entity: 'blog', 
        entityId: 'blog-012', 
        entityTitle: 'Old Blog Post',
        time: '1 day ago',
        userEmail: 'admin@example.com',
        timestamp: Date.now() - 86400000
      },
      { 
        action: 'update', 
        entity: 'calendar', 
        entityId: 'event-008', 
        entityTitle: 'Team Meeting',
        time: '2 days ago',
        userEmail: 'admin@example.com',
        timestamp: Date.now() - 172800000
      },
      { 
        action: 'create', 
        entity: 'resource', 
        entityId: 'resource-006', 
        entityTitle: 'Conflict Resolution Handbook',
        time: '3 days ago',
        userEmail: 'admin@example.com',
        timestamp: Date.now() - 259200000
      },
      { 
        action: 'update', 
        entity: 'lead', 
        entityId: 'lead-002', 
        entityTitle: 'Maria Garcia - HR Manager',
        time: '4 days ago',
        userEmail: 'admin@example.com',
        timestamp: Date.now() - 345600000
      },
      { 
        action: 'create', 
        entity: 'blog', 
        entityId: 'blog-013', 
        entityTitle: 'Effective Leadership Strategies',
        time: '5 days ago',
        userEmail: 'admin@example.com',
        timestamp: Date.now() - 432000000
      },
      { 
        action: 'delete', 
        entity: 'testimonial', 
        entityId: 'testimonial-004', 
        entityTitle: 'Outdated Testimonial',
        time: '1 week ago',
        userEmail: 'admin@example.com',
        timestamp: Date.now() - 604800000
      },
    ];

    return activities;
  }

  /**
   * Helper method to generate random numbers within a range
   */
  private getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
} 