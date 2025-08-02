import type { AuditLog } from '@/shared/types/audit';
import { generateActivityDescription } from './activityTemplates';

type FakeAuditDataOptions = {
  count?: number;
  dateRange?: { start: Date; end: Date };
  entityTypes?: string[];
  actions?: string[];
  userEmails?: string[];
};

const fakeUserEmails = [
  'admin@nobilis.com',
  'kareem.payne@nobilis.com',
  'assistant@nobilis.com',
  'support@nobilis.com',
  'demo@nobilis.com'
];

const fakeEntityIds = [
  'lead-001', 'lead-002', 'lead-003', 'lead-004', 'lead-005',
  'resource-001', 'resource-002', 'resource-003', 'resource-004',
  'testimonial-001', 'testimonial-002', 'testimonial-003',
  'blog-001', 'blog-002', 'blog-003',
  'event-001', 'event-002', 'event-003',
  'payment-001', 'payment-002', 'payment-003'
];

const fakeIPAddresses = [
  '192.168.1.100',
  '10.0.0.50',
  '172.16.0.25',
  '203.0.113.10',
  '198.51.100.5'
];

const fakeTitles = [
  'Executive Coaching Session',
  'Leadership Development Workshop',
  'Team Building Exercise',
  'Strategic Planning Meeting',
  'Performance Review',
  'Goal Setting Session',
  'Communication Skills Training',
  'Conflict Resolution Workshop',
  'Time Management Seminar',
  'Decision Making Framework'
];

const fakeDescriptions = [
  'Comprehensive leadership assessment and development plan created',
  'Team performance analysis and improvement strategies implemented',
  'Strategic objectives aligned with organizational goals',
  'Communication protocols established for better team collaboration',
  'Performance metrics and KPIs defined for tracking progress'
];

export function generateFakeAuditLogs(options: FakeAuditDataOptions = {}): AuditLog[] {
  const {
    count = 50,
    dateRange = { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
    entityTypes = ['lead', 'resource', 'testimonial', 'blog', 'calendar', 'auth'],
    actions = ['create', 'update', 'delete', 'login'],
    userEmails = fakeUserEmails
  } = options;

  const logs: AuditLog[] = [];

  for (let i = 0; i < count; i++) {
    const entity = entityTypes[Math.floor(Math.random() * entityTypes.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const userEmail = userEmails[Math.floor(Math.random() * userEmails.length)];
    const entityId = fakeEntityIds[Math.floor(Math.random() * fakeEntityIds.length)];
    const ipAddress = fakeIPAddresses[Math.floor(Math.random() * fakeIPAddresses.length)];
    const title = fakeTitles[Math.floor(Math.random() * fakeTitles.length)];
    const description = fakeDescriptions[Math.floor(Math.random() * fakeDescriptions.length)];
    
    // Generate random timestamp within the date range
    const timestamp = new Date(
      dateRange.start.getTime() + Math.random() * (dateRange.end.getTime() - dateRange.start.getTime())
    );

    // Generate activity description using templates
    const activityDescription = generateActivityDescription(action, entity, {
      title,
      description,
      ipAddress,
      entityId
    });

    const log: AuditLog = {
      id: `fake-${Date.now()}-${i}`,
      action: action as 'create' | 'update' | 'delete' | 'login',
      entity: entity as 'lead' | 'resource' | 'testimonial' | 'blog' | 'calendar' | 'auth',
      entityId,
      userEmail,
      userId: `fake-user-${Math.floor(Math.random() * 1000)}`,
      timestamp: timestamp.getTime(),
      details: {
        title: activityDescription,
        description,
        ipAddress,
        entityId
      }
    };

    logs.push(log);
  }

  // Sort by timestamp (newest first)
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getFakeAuditLogsWithFilters(
  logs: AuditLog[],
  search?: string,
  entityType?: string,
  action?: string
): AuditLog[] {
  let filteredLogs = [...logs];

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredLogs = filteredLogs.filter(log => {
      const detailsTitle = typeof log.details === 'string'
        ? log.details
        : log.details?.title || '';

      return (
        (typeof detailsTitle === 'string' && detailsTitle.toLowerCase().includes(searchLower)) ||
        (typeof log.userEmail === 'string' && log.userEmail.toLowerCase().includes(searchLower)) ||
        (typeof log.entityId === 'string' && log.entityId.toLowerCase().includes(searchLower)) ||
        (typeof log.action === 'string' && log.action.toLowerCase().includes(searchLower)) ||
        (typeof log.entity === 'string' && log.entity.toLowerCase().includes(searchLower))
      );
    });
  }

  // Apply entity type filter
  if (entityType && entityType !== 'all') {
    filteredLogs = filteredLogs.filter(log => log.entity === entityType);
  }

  // Apply action filter
  if (action && action !== 'all') {
    filteredLogs = filteredLogs.filter(log => log.action === action);
  }

  return filteredLogs;
}

export function getFakeAuditLogsPaginated(
  logs: AuditLog[],
  page: number = 1,
  limit: number = 20
): { logs: AuditLog[]; total: number; page: number; limit: number } {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedLogs = logs.slice(startIndex, endIndex);

  return {
    logs: paginatedLogs,
    total: logs.length,
    page,
    limit
  };
} 