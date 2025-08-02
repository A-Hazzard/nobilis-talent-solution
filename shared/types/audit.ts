export type AuditLog = {
  id?: string; // Firestore doc ID
  timestamp: number; // Unix ms
  userId: string;
  userEmail?: string;
  action: 'login' | 'create' | 'update' | 'delete';
  entity: 'lead' | 'resource' | 'testimonial' | 'blog' | 'calendar' | 'auth' | 'contact';
  entityId?: string;
  details?: Record<string, any>;
}; 