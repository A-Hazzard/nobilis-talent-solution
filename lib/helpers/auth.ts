import { NextRequest } from 'next/server';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import type { AuthResult } from '@/app/api/lib/types/auth';

// Initialize Firebase Admin if not already initialized and we have the required env vars
function initializeFirebaseAdmin() {
  if (getApps().length > 0) return; // Already initialized
  
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.warn('Firebase Admin credentials not found, skipping initialization');
    console.warn('Missing env vars:', {
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY
    });
    return;
  }

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

/**
 * Get authenticated user from request
 */
export async function getAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Initialize Firebase Admin if needed
    initializeFirebaseAdmin();
    
    let token: string | null = null;
    
    // First try to get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    
    // If no token in header, try to get from cookie
    if (!token) {
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);
        
        token = cookies['auth-token'] || null;
      }
    }
    
    if (!token) {
      return { user: null };
    }

    // Check if Firebase Admin is initialized
    if (getApps().length === 0) {
      console.warn('Firebase Admin not initialized, authentication skipped');
      return { user: null };
    }

    // Verify the token
    const decodedToken = await getFirebaseAuth().verifyIdToken(token);
    
    // Check if role is in custom claims, otherwise fetch from Firestore
    let userRole = decodedToken.role || 'user';
    
    // If no role in token and we have admin UID, set as admin
    if (!decodedToken.role && decodedToken.uid === 'wG2jJtLiFCOaRF6jZ2DMo8u8yAh1') {
      userRole = 'admin';
    }
    
    // If still no admin role, try fetching from Firestore as fallback
    if (userRole === 'user') {
      try {
        const { getAdminFirestore } = await import('@/lib/firebase/admin');
        const db = getAdminFirestore();
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData?.role === 'admin') {
            userRole = 'admin';
          }
        }
      } catch (firestoreError) {
        console.error('Error fetching user role from Firestore:', firestoreError);
        // Continue with default role
      }
    }
    
    return {
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        role: userRole,
      }
    };
  } catch (error) {
    console.error('Auth error:', error);
    return { 
      user: null, 
      error: error instanceof Error ? error.message : 'Authentication failed' 
    };
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const authResult = await getAuth(request);
  return authResult.user !== null;
}

/**
 * Check if user is admin
 */
export async function isAdmin(request: NextRequest): Promise<boolean> {
  const authResult = await getAuth(request);
  return authResult.user?.role === 'admin';
} 