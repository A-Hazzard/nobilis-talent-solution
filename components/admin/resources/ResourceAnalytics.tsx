'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  Users,
  BarChart3,
  ExternalLink,
  Clock
} from 'lucide-react';
import { DownloadAnalyticsService } from '@/lib/services/DownloadAnalyticsService';
import type { Resource } from '@/shared/types/entities';

interface ResourceAnalyticsProps {
  resource: Resource;
  isOpen: boolean;
  onClose: () => void;
}

export function ResourceAnalytics({ resource, isOpen, onClose }: ResourceAnalyticsProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && resource.id) {
      loadResourceAnalytics();
    }
  }, [isOpen, resource.id]);

  const loadResourceAnalytics = async () => {
    setIsLoading(true);
    try {
      const analyticsService = DownloadAnalyticsService.getInstance();
      const response = await analyticsService.getResourcePerformance(resource.id);
      
      if (response) {
        setAnalytics(response);
      }
    } catch (error) {
      console.error('Error loading resource analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Resource Analytics</h2>
              <p className="text-gray-600">{resource.title}</p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
              <Skeleton className="h-64" />
            </div>
          ) : analytics ? (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(analytics.totalDownloads)}</div>
                    <p className="text-xs text-muted-foreground">
                      All time downloads
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Week</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(analytics.downloadsThisWeek)}</div>
                    <p className="text-xs text-muted-foreground">
                      Downloads in last 7 days
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Month</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(analytics.downloadsThisMonth)}</div>
                    <p className="text-xs text-muted-foreground">
                      Downloads in last 30 days
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Average Downloads/Day</span>
                      <span className="font-medium">{analytics.averageDownloadsPerDay}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Download Trend</span>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(analytics.downloadTrend)}
                        <span className={`text-sm font-medium ${getTrendColor(analytics.downloadTrend)}`}>
                          {analytics.downloadTrend}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Resource Type</span>
                      <Badge variant="secondary" className="capitalize">
                        {resource.type}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Category</span>
                      <Badge variant="outline" className="capitalize">
                        {resource.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Traffic Sources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.topReferrers && analytics.topReferrers.length > 0 ? (
                      <div className="space-y-3">
                        {analytics.topReferrers.map((referrer: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                #{index + 1}
                              </Badge>
                              <span className="text-sm font-medium truncate max-w-32">
                                {referrer.referrer || 'Direct'}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatNumber(referrer.count)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ExternalLink className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No referrer data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Resource Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Resource Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Title:</span>
                          <span className="font-medium">{resource.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium capitalize">{resource.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium capitalize">{resource.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Featured:</span>
                          <span className="font-medium">{resource.featured ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Timestamps</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="font-medium">
                            {resource.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Updated:</span>
                          <span className="font-medium">
                            {resource.updatedAt.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Downloaded:</span>
                          <span className="font-medium">
                            {analytics.lastDownloaded ? 
                              new Date(analytics.lastDownloaded).toLocaleDateString() : 
                              'Never'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12">
              <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data</h3>
              <p className="text-gray-600">Analytics data will appear once downloads start occurring.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 