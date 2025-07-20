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
    const conversionRate = this.getRandomNumber(15, 35);
    const totalRevenue = this.getRandomNumber(50000, 200000);
    const revenueThisMonth = this.getRandomNumber(5000, 25000);
    const activeUsers = this.getRandomNumber(50, 200);
    const resourceDownloads = this.getRandomNumber(300, 1200);

    return {
      totalLeads,
      leadsThisMonth,
      conversionRate,
      totalRevenue,
      revenueThisMonth,
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
    const totalLeads = this.getRandomNumber(150, 500);
    
    return {
      leadsByMonth: {
        labels: months,
        data: months.map(() => this.getRandomNumber(15, 80)),
      },
      leadsByStatus: {
        labels: ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'],
        data: [
          this.getRandomNumber(20, 60),
          this.getRandomNumber(15, 45),
          this.getRandomNumber(10, 35),
          this.getRandomNumber(5, 25),
          this.getRandomNumber(5, 20),
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
      { action: 'New lead received', time: '2 min ago' },
      { action: 'Resource downloaded', time: '1 hour ago' },
      { action: 'Meeting scheduled', time: '3 hours ago' },
      { action: 'Payment received', time: '5 hours ago' },
      { action: 'Testimonial submitted', time: '1 day ago' },
      { action: 'Follow-up email sent', time: '2 days ago' },
    ];

    return activities.slice(0, 3);
  }

  /**
   * Generate fake performance metrics
   */
  generateFakePerformanceMetrics() {
    return [
      { metric: 'Conversion Rate', value: '+2.1%', positive: true },
      { metric: 'Response Time', value: '-0.5h', positive: true },
      { metric: 'Lead Quality', value: '+5%', positive: true },
      { metric: 'Customer Satisfaction', value: '+3.2%', positive: true },
    ];
  }

  /**
   * Generate fake upcoming events
   */
  generateFakeUpcomingEvents() {
    const events = [
      { event: 'Client Meeting', time: 'Tomorrow, 2:00 PM' },
      { event: 'Team Workshop', time: 'Wednesday, 10:00 AM' },
      { event: 'Strategy Session', time: 'Friday, 3:00 PM' },
      { event: 'Follow-up Call', time: 'Next Monday, 11:00 AM' },
    ];

    return events.slice(0, 3);
  }

  /**
   * Helper method to generate random numbers within a range
   */
  private getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
} 