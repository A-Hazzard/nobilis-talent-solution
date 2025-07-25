import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { AuditLog } from '@/shared/types/audit';

/**
 * Log an admin action to Firestore
 */
export async function logAdminAction(log: Omit<AuditLog, 'id'>): Promise<void> {
  try {
    await addDoc(collection(db, 'adminLogs'), {
      ...log,
      timestamp: log.timestamp || Date.now(),
    });
  } catch (error) {
    // Logging should never break main flow
    console.error('Failed to log admin action:', error);
  }
} 