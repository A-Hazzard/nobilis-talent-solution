/**
 * Activity templates for generating descriptive audit messages
 */

type ActivityTemplate = {
  action: string;
  entity: string;
  template: (details: Record<string, any>) => string;
};

const activityTemplates: ActivityTemplate[] = [
  // User actions
  {
    action: 'login',
    entity: 'auth',
    template: () => 'User logged into the system'
  },
  {
    action: 'logout',
    entity: 'auth',
    template: () => 'User logged out of the system'
  },
  {
    action: 'create',
    entity: 'user',
    template: (details) => `Created new user account for ${details.email || 'unknown email'}`
  },
  {
    action: 'update',
    entity: 'user',
    template: (details) => `Updated user profile for ${details.email || 'unknown user'}`
  },

  // Lead actions
  {
    action: 'create',
    entity: 'lead',
    template: (details) => `Created new lead: ${details.firstName || ''} ${details.lastName || ''} (${details.email || 'no email'})`
  },
  {
    action: 'update',
    entity: 'lead',
    template: (details) => `Updated lead information for ${details.firstName || ''} ${details.lastName || ''}`
  },
  {
    action: 'delete',
    entity: 'lead',
    template: (details) => `Deleted lead: ${details.firstName || ''} ${details.lastName || ''}`
  },

  // Resource actions
  {
    action: 'create',
    entity: 'resource',
    template: (details) => `Created new resource: ${details.title || 'Untitled'}`
  },
  {
    action: 'update',
    entity: 'resource',
    template: (details) => `Updated resource: ${details.title || 'Untitled'}`
  },
  {
    action: 'delete',
    entity: 'resource',
    template: (details) => `Deleted resource: ${details.title || 'Untitled'}`
  },
  {
    action: 'download',
    entity: 'resource',
    template: (details) => `Downloaded resource: ${details.title || 'Untitled'}`
  },

  // Testimonial actions
  {
    action: 'create',
    entity: 'testimonial',
    template: (details) => `Added new testimonial from ${details.clientName || 'anonymous'}`
  },
  {
    action: 'update',
    entity: 'testimonial',
    template: (details) => `Updated testimonial from ${details.clientName || 'anonymous'}`
  },
  {
    action: 'delete',
    entity: 'testimonial',
    template: (details) => `Deleted testimonial from ${details.clientName || 'anonymous'}`
  },

  // Blog actions
  {
    action: 'create',
    entity: 'blog',
    template: (details) => `Created new blog post: ${details.title || 'Untitled'}`
  },
  {
    action: 'update',
    entity: 'blog',
    template: (details) => `Updated blog post: ${details.title || 'Untitled'}`
  },
  {
    action: 'delete',
    entity: 'blog',
    template: (details) => `Deleted blog post: ${details.title || 'Untitled'}`
  },
  {
    action: 'publish',
    entity: 'blog',
    template: (details) => `Published blog post: ${details.title || 'Untitled'}`
  },

  // Calendar actions
  {
    action: 'create',
    entity: 'calendar',
    template: (details) => `Created new event: ${details.title || 'Untitled'}`
  },
  {
    action: 'update',
    entity: 'calendar',
    template: (details) => `Updated event: ${details.title || 'Untitled'}`
  },
  {
    action: 'delete',
    entity: 'calendar',
    template: (details) => `Deleted event: ${details.title || 'Untitled'}`
  },
  {
    action: 'sync',
    entity: 'calendar',
    template: () => 'Synchronized calendar with external service'
  },

  // Payment actions
  {
    action: 'create',
    entity: 'payment',
    template: (details) => `Created payment link for ${details.clientName || 'client'} - $${details.amount || 0}`
  },
  {
    action: 'complete',
    entity: 'payment',
    template: (details) => `Payment completed for ${details.clientName || 'client'} - $${details.amount || 0}`
  },
  {
    action: 'cancel',
    entity: 'payment',
    template: (details) => `Payment cancelled for ${details.clientName || 'client'}`
  },

  // Admin actions
  {
    action: 'export',
    entity: 'data',
    template: (details) => `Exported ${details.type || 'data'} to ${details.format || 'file'}`
  },
  {
    action: 'import',
    entity: 'data',
    template: (details) => `Imported ${details.type || 'data'} from ${details.source || 'file'}`
  },
  {
    action: 'backup',
    entity: 'system',
    template: () => 'Created system backup'
  },
  {
    action: 'restore',
    entity: 'system',
    template: () => 'Restored system from backup'
  }
];

/**
 * Generate a descriptive activity message based on action and entity
 */
export function generateActivityDescription(
  action: string,
  entity: string,
  details: Record<string, any> = {}
): string {
  const template = activityTemplates.find(
    t => t.action === action && t.entity === entity
  );

  if (template) {
    return template.template(details);
  }

  // Fallback for unknown combinations
  return `${action.charAt(0).toUpperCase() + action.slice(1)} ${entity}`;
}

/**
 * Get all available activity templates
 */
export function getActivityTemplates(): ActivityTemplate[] {
  return activityTemplates;
}

/**
 * Check if an activity template exists
 */
export function hasActivityTemplate(action: string, entity: string): boolean {
  return activityTemplates.some(t => t.action === action && t.entity === entity);
} 