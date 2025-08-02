'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Download, 
  TrendingUp, 
  FileText, 
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Eye,
  Share2,
  Filter
} from 'lucide-react';
import { DownloadAnalyticsService } from '@/lib/services/DownloadAnalyticsService';
import { ResourcesService } from '@/lib/services/ResourcesService';
import type { DownloadAnalytics } from '@/lib/types/services';
import type { Resource } from '@/shared/types/entities';

// Analytics Dashboard Component
export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<DownloadAnalytics | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadAnalytics();
    loadResources();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const analyticsService = DownloadAnalyticsService.getInstance();
      const response = await analyticsService.getAnalytics();
      
      if (response.success && response.data) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadResources = async () => {
    try {
      const resourcesService = new ResourcesService();
      const response = await resourcesService.getAll();
      
      if (!response.error) {
        setResources(response.resources);
      }
    } catch (error) {
      console.error('Error loading resources:', error);
    }
  };

  const getFilteredResources = () => {
    let filtered = resources;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    return filtered;
  };

  const getTopResources = () => {
    return getFilteredResources()
      .sort((a, b) => b.downloadCount - a.downloadCount)
      .slice(0, 10);
  };

  const getCategoryStats = () => {
    const categoryMap = new Map<string, { count: number; downloads: number }>();
    
    getFilteredResources().forEach(resource => {
      const category = resource.category || 'other';
      const current = categoryMap.get(category) || { count: 0, downloads: 0 };
      categoryMap.set(category, {
        count: current.count + 1,
        downloads: current.downloads + resource.downloadCount
      });
    });

    return Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      ...stats
    })).sort((a, b) => b.downloads - a.downloads);
  };

  const getTypeStats = () => {
    const typeMap = new Map<string, { count: number; downloads: number }>();
    
    getFilteredResources().forEach(resource => {
      const type = resource.type || 'other';
      const current = typeMap.get(type) || { count: 0, downloads: 0 };
      typeMap.set(type, {
        count: current.count + 1,
        downloads: current.downloads + resource.downloadCount
      });
    });

    return Array.from(typeMap.entries()).map(([type, stats]) => ({
      type,
      ...stats
    })).sort((a, b) => b.downloads - a.downloads);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };



  const handleExport = async () => {
    try {
      const response = await fetch(`/api/analytics/export?timeRange=${timeRange}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to export analytics');
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track resource performance and user engagement</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(value: '7d' | '30d' | '90d') => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Filter className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics?.totalDownloads || 0)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics?.downloadsToday || 0)}</div>
            <p className="text-xs text-muted-foreground">
              <Clock className="inline h-3 w-3 mr-1 text-blue-500" />
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Resources</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(resources.length)}</div>
            <p className="text-xs text-muted-foreground">
              <Eye className="inline h-3 w-3 mr-1 text-purple-500" />
              Public resources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Downloads</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resources.length > 0 ? formatNumber(Math.round(analytics?.totalDownloads || 0 / resources.length)) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <Share2 className="inline h-3 w-3 mr-1 text-orange-500" />
              Per resource
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resources">Top Resources</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Download Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Download Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">This Week</span>
                    <span className="font-medium">{formatNumber(analytics?.downloadsThisWeek || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">This Month</span>
                    <span className="font-medium">{formatNumber(analytics?.downloadsThisMonth || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="font-medium">{formatNumber(analytics?.totalDownloads || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Popular Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Popular Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.popularResources?.slice(0, 5).map((resource, index) => (
                    <div key={resource.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <span className="text-sm font-medium truncate max-w-32">
                          {resource.title}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(resource.downloadCount)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="leadership">Leadership</SelectItem>
                <SelectItem value="team-building">Team Building</SelectItem>
                <SelectItem value="strategy">Strategy</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="management">Management</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="innovation">Innovation</SelectItem>
                <SelectItem value="culture">Culture</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="whitepaper">Whitepaper</SelectItem>
                <SelectItem value="template">Template</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="image">Image</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {getTopResources().map((resource, index) => (
                  <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="text-sm">
                        #{index + 1}
                      </Badge>
                      <div>
                        <h3 className="font-medium">{resource.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {resource.category} • {resource.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatNumber(resource.downloadCount)}</div>
                      <div className="text-sm text-muted-foreground">downloads</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getCategoryStats().map((stat) => (
                    <div key={stat.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="font-medium capitalize">{stat.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(stat.downloads)}</div>
                        <div className="text-sm text-muted-foreground">
                          {stat.count} resources
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Type Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Type Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getTypeStats().map((stat) => (
                    <div key={stat.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-secondary rounded-full"></div>
                        <span className="font-medium capitalize">{stat.type}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(stat.downloads)}</div>
                        <div className="text-sm text-muted-foreground">
                          {stat.count} resources
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.recentDownloads?.map((download) => (
                  <div key={download.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Download className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{download.resourceTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          {download.userEmail || 'Anonymous user'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {download.timestamp.toDate().toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {download.timestamp.toDate().toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 