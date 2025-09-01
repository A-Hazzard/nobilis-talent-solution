import { getApps, initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let initialized = false;

/**
 * Lazily initialize and return Firebase Admin Auth.
 * Avoids build-time crashes by deferring env access until runtime.
 */
function initializeAdminIfNeeded(): void {
  if (!initialized && !getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKeyRaw) {
      throw new Error('Missing Firebase Admin credentials in environment');
    }

    const serviceAccount: ServiceAccount = {
      projectId,
      clientEmail,
      privateKey: privateKeyRaw.replace(/\\n/g, '\n'),
    };

    initializeApp({
      credential: cert(serviceAccount),
    });
    initialized = true;
  }
}

export function getAdminAuth(): Auth {
  initializeAdminIfNeeded();
  return getAuth();
}

export function getAdminFirestore(): Firestore {
  initializeAdminIfNeeded();
  return getFirestore();
}



