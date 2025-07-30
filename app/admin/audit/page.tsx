'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, Activity } from 'lucide-react';
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
}

export default function AuditLogsPage() {
  const { toast } = useToast();
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
  });

  const loadAuditLogs = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
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
    } catch (error) {
      console.error('Error loading audit logs:', error);
      setState(prev => ({ ...prev, error: 'Failed to load audit logs' }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.currentPage, state.searchTerm, state.entityTypeFilter, state.actionFilter]);

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
      
      // Load all logs for export (not just current page)
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
  }, [state.searchTerm, state.entityTypeFilter, state.actionFilter, toast]);

  const handleCreateSampleData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await fetch('/api/audit/test', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Sample Data Created',
          description: `Successfully created ${result.count} sample audit logs.`,
        });
        
        // Reload the audit logs to show the new data
        await loadAuditLogs();
      } else {
        throw new Error(result.error || 'Failed to create sample data');
      }
    } catch (error) {
      console.error('Error creating sample data:', error);
      toast({
        title: 'Sample Data Creation Failed',
        description: 'Failed to create sample audit logs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [loadAuditLogs, toast]);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">Track all admin activities and system changes</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
            disabled={state.isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCreateSampleData}
            disabled={state.isLoading}
          >
            <Activity className="h-4 w-4 mr-2" />
            Create Sample Data
          </Button>
        </div>
      </div>

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
          </CardTitle>
          <p className="text-sm text-gray-600">
            Showing {state.logs.length} of {state.totalLogs} logs
          </p>
        </CardHeader>
        <CardContent>
          {state.logs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No audit logs found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {state.logs.map((log) => {
                const entityIcon = getEntityIcon(log.entity);
                const actionIcon = getActionIcon(log.action);
                
                return (
                  <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    {/* Entity Icon */}
                    <div className={`flex-shrink-0 p-2 rounded-lg ${entityIcon.bgColor}`}>
                      <entityIcon.Icon className={`h-5 w-5 ${entityIcon.color}`} />
                  </div>
                    
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        {/* Action Badge with Icon */}
                        <Badge className={`flex items-center gap-1 ${getActionBadgeColors(log.action)}`}>
                          <actionIcon.Icon className="h-3 w-3" />
                          {log.action.toUpperCase()}
                        </Badge>
                        
                        {/* Entity Type Badge */}
                        <Badge className={`flex items-center gap-1 ${getEntityTypeBadgeColors(log.entity)}`}>
                          <entityIcon.Icon className="h-3 w-3" />
                          {log.entity.toUpperCase()}
                        </Badge>
                        
                      <span className="text-sm text-gray-500">
                        {formatTimeAgo(new Date(log.timestamp))}
                      </span>
                    </div>
                      
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">
                        {log.details?.title || log.entityId || 'Untitled'}
                      </p>
                      {log.details && typeof log.details === 'string' && (
                        <p className="text-sm text-gray-600">{log.details}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>By: {log.userEmail}</span>
                        {log.details?.ipAddress && <span>IP: {log.details.ipAddress}</span>}
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