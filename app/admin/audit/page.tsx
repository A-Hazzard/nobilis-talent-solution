'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, Activity, Play } from 'lucide-react';
import type { AuditLog } from '@/shared/types/audit';
import { 
  formatTimeAgo, 
  getEntityIcon, 
  getActionIcon, 
  getActionBadgeColors, 
  getEntityTypeBadgeColors,
  exportAuditLogsToExcel
} from '@/lib/utils/auditUtils';
import { useToast } from '@/lib/hooks/use-toast';
import { useDemoStore } from '@/lib/stores/demoStore';
import { 
  generateFakeAuditLogs, 
  getFakeAuditLogsWithFilters, 
  getFakeAuditLogsPaginated 
} from '@/lib/utils/fakeAuditData';

// Force dynamic rendering to prevent pre-rendering issues
export const dynamic = 'force-dynamic';

interface AuditLogsState {
  logs: AuditLog[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalLogs: number;
  searchTerm: string;
  entityTypeFilter: string;
  actionFilter: string;
  error: string | null;
  fakeLogs: AuditLog[]; // Store fake logs for demo mode
}

export default function AuditLogsPage() {
  const { toast } = useToast();
  const { isDemoMode } = useDemoStore();
  const [state, setState] = useState<AuditLogsState>({
    logs: [],
    isLoading: true,
    currentPage: 1,
    totalPages: 1,
    totalLogs: 0,
    searchTerm: '',
    entityTypeFilter: '',
    actionFilter: '',
    error: null,
    fakeLogs: [], // Initialize empty fake logs
  });

  // Generate fake logs when demo mode is enabled
  useEffect(() => {
    if (isDemoMode && state.fakeLogs.length === 0) {
      const fakeLogs = generateFakeAuditLogs({ count: 100 });
      setState(prev => ({ ...prev, fakeLogs }));
    }
  }, [isDemoMode, state.fakeLogs.length]);

  const loadAuditLogs = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      if (isDemoMode) {
        // Use fake data in demo mode
        const filteredLogs = getFakeAuditLogsWithFilters(
          state.fakeLogs,
          state.searchTerm,
          state.entityTypeFilter,
          state.actionFilter
        );
        
        const paginatedResult = getFakeAuditLogsPaginated(
          filteredLogs,
          state.currentPage,
          20
        );
        
        setState(prev => ({
          ...prev,
          logs: paginatedResult.logs,
          totalLogs: paginatedResult.total,
          totalPages: Math.ceil(paginatedResult.total / paginatedResult.limit),
          currentPage: paginatedResult.page,
        }));
      } else {
        // Use real API in normal mode
        const params = new URLSearchParams({
          page: state.currentPage.toString(),
          limit: '20',
        });

        if (state.searchTerm) {
          params.append('search', state.searchTerm);
        }

        if (state.entityTypeFilter && state.entityTypeFilter !== 'all') {
          params.append('entityType', state.entityTypeFilter);
        }

        if (state.actionFilter && state.actionFilter !== 'all') {
          params.append('action', state.actionFilter);
        }

        const response = await fetch(`/api/audit/logs?${params}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();

        if (result.success) {
          const { logs, total, page, limit } = result.data;
          const totalPages = Math.ceil(total / limit);
          
          setState(prev => ({
            ...prev,
            logs,
            totalLogs: total,
            totalPages,
            currentPage: page,
          }));
        } else {
          setState(prev => ({ ...prev, error: result.error || 'Failed to load audit logs' }));
        }
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
      setState(prev => ({ ...prev, error: 'Failed to load audit logs' }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [isDemoMode, state.currentPage, state.searchTerm, state.entityTypeFilter, state.actionFilter, state.fakeLogs]);

  const handleSearch = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term, currentPage: 1 }));
  }, []);

  const handleEntityTypeFilter = useCallback((entityType: string) => {
    setState(prev => ({ ...prev, entityTypeFilter: entityType, currentPage: 1 }));
  }, []);

  const handleActionFilter = useCallback((action: string) => {
    setState(prev => ({ ...prev, actionFilter: action, currentPage: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const handleExport = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      if (isDemoMode) {
        // Export fake data in demo mode
        const filteredLogs = getFakeAuditLogsWithFilters(
          state.fakeLogs,
          state.searchTerm,
          state.entityTypeFilter,
          state.actionFilter
        );
        
        await exportAuditLogsToExcel(filteredLogs, {
          searchTerm: state.searchTerm,
          entityTypeFilter: state.entityTypeFilter,
          actionFilter: state.actionFilter,
        });

        toast({
          title: 'Export Successful',
          description: 'Demo audit logs have been exported to Excel successfully.',
        });
      } else {
        // Export real data in normal mode
        const params = new URLSearchParams({
          page: '1',
          limit: '1000', // Get more logs for export
        });

        if (state.searchTerm) {
          params.append('search', state.searchTerm);
        }

        if (state.entityTypeFilter && state.entityTypeFilter !== 'all') {
          params.append('entityType', state.entityTypeFilter);
        }

        if (state.actionFilter && state.actionFilter !== 'all') {
          params.append('action', state.actionFilter);
        }

        const response = await fetch(`/api/audit/logs?${params}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();

        if (result.success) {
          const { logs } = result.data;
          
          await exportAuditLogsToExcel(logs, {
            searchTerm: state.searchTerm,
            entityTypeFilter: state.entityTypeFilter,
            actionFilter: state.actionFilter,
          });

          toast({
            title: 'Export Successful',
            description: 'Audit logs have been exported to Excel successfully.',
          });
        } else {
          throw new Error(result.error || 'Failed to load logs for export');
        }
      }
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export audit logs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [isDemoMode, state.fakeLogs, state.searchTerm, state.entityTypeFilter, state.actionFilter, toast]);



  // Load data when filters change
  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  if (state.isLoading && state.logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Audit Logs</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 break-words">
            {isDemoMode 
              ? 'Demo mode: Showing sample audit data for testing and demonstration'
              : 'Track all admin activities and system changes'
            }
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
            disabled={state.isLoading}
            className="text-xs sm:text-sm"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Export Excel</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* Demo Mode Indicator */}
      {isDemoMode && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-900">Demo Mode Active</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {state.fakeLogs.length} demo logs available
              </Badge>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              You're viewing sample audit data. All search and filter features work with the demo data.
              Toggle demo mode in the dashboard to switch between real and demo data.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={state.searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={state.entityTypeFilter} onValueChange={handleEntityTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="lead">Leads</SelectItem>
                <SelectItem value="resource">Resources</SelectItem>
                <SelectItem value="testimonial">Testimonials</SelectItem>
                <SelectItem value="calendar">Calendar</SelectItem>
                <SelectItem value="blog">Blog</SelectItem>
                <SelectItem value="auth">Authentication</SelectItem>
              </SelectContent>
            </Select>
            <Select value={state.actionFilter} onValueChange={handleActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="login">Login</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {state.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{state.error}</p>
          </CardContent>
        </Card>
      )}

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Log
            {isDemoMode && (
              <Badge variant="secondary" className="ml-2">
                Demo Data
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-gray-600">
            Showing {state.logs.length} of {state.totalLogs} logs
            {isDemoMode && ` (${state.fakeLogs.length} total demo logs available)`}
          </p>
        </CardHeader>
        <CardContent>
          {state.logs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {isDemoMode 
                  ? 'No demo audit logs match your current filters'
                  : 'No audit logs found'
                }
              </p>

            </div>
          ) : (
            <div className="space-y-4">
              {state.logs.map((log) => {
                const entityIcon = getEntityIcon(log.entity);
                const actionIcon = getActionIcon(log.action);
                
                return (
                  <div key={log.id} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    {/* Entity Icon */}
                    <div className={`flex-shrink-0 p-2 rounded-lg ${entityIcon.bgColor}`}>
                      <entityIcon.Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${entityIcon.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {/* Action Badge with Icon */}
                        <Badge className={`flex items-center gap-1 text-xs ${getActionBadgeColors(log.action)}`}>
                          <actionIcon.Icon className="h-3 w-3" />
                          <span className="hidden sm:inline">{log.action.toUpperCase()}</span>
                          <span className="sm:hidden capitalize">{log.action}</span>
                        </Badge>
                        
                        {/* Entity Type Badge */}
                        <Badge className={`flex items-center gap-1 text-xs ${getEntityTypeBadgeColors(log.entity)}`}>
                          <entityIcon.Icon className="h-3 w-3" />
                          <span className="hidden sm:inline">{log.entity.toUpperCase()}</span>
                          <span className="sm:hidden capitalize">{log.entity}</span>
                        </Badge>
                        
                        {/* Demo indicator */}
                        {isDemoMode && log.id?.startsWith('fake-') && (
                          <Badge variant="outline" className="text-xs">
                            Demo
                          </Badge>
                        )}
                        
                        <span className="text-xs sm:text-sm text-gray-500 break-words">
                          {formatTimeAgo(new Date(log.timestamp))}
                        </span>
                      </div>
                        
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base break-words">
                          {(() => {
                            // Parse details if it's a JSON string
                            let parsedDetails = log.details;
                            if (typeof log.details === 'string') {
                              try {
                                parsedDetails = JSON.parse(log.details);
                                return parsedDetails?.title || log.entityId || 'Untitled';
                              } catch {
                                return log.details || log.entityId || 'Untitled';
                              }
                            }
                            return parsedDetails?.title || log.entityId || 'Untitled';
                          })()}
                        </p>
                        {(() => {
                          // Parse details for description
                          let parsedDetails = log.details;
                          if (typeof log.details === 'string') {
                            try {
                              parsedDetails = JSON.parse(log.details);
                            } catch {
                              return null;
                            }
                          }
                          return parsedDetails?.description ? (
                            <p className="text-xs sm:text-sm text-gray-600 break-words">{parsedDetails.description}</p>
                          ) : null;
                        })()}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                          <span className="break-all">By: {log.userEmail}</span>
                          {(() => {
                            // Parse details for IP address
                            let parsedDetails = log.details;
                            if (typeof log.details === 'string') {
                              try {
                                parsedDetails = JSON.parse(log.details);
                              } catch {
                                return null;
                              }
                            }
                            return parsedDetails?.ipAddress ? (
                              <span className="break-all">IP: {parsedDetails.ipAddress}</span>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {state.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {state.currentPage} of {state.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(state.currentPage - 1)}
              disabled={state.currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(state.currentPage + 1)}
              disabled={state.currentPage === state.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 