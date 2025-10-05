import { User } from '@/shared/types/entities';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

/**
 * Determines the appropriate redirect path based on user role and onboarding status
 * @param user - The authenticated user
 * @param isLogin - Whether this is a login flow (true) or signup flow (false)
 * @returns The path to redirect to
 */
export function getRedirectPath(user: User | null, isLogin: boolean = false): string {
  if (!user) {
    return '/';
  }
  // Reference isLogin to satisfy lint rule without changing logic
  void isLogin;

  // For new signups, always redirect to onboarding first
  // For Google sign-in users, if onboardingCompleted is undefined, assume they're existing users
  if (user.role !== 'admin' && (user.onboardingCompleted === false || user.onboardingCompleted === undefined)) {
    return '/onboarding';
  }

  // Admin users go to admin dashboard
  if (user.role === 'admin') {
    return '/admin';
  }

  // Regular users go to content page
  return '/content';
}

/**
 * Checks if a user should be redirected to admin dashboard
 * @param user - The authenticated user
 * @returns True if user should be redirected to admin
 */
export function shouldRedirectToAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

/**
 * Checks if a user should be redirected to home page
 * @param user - The authenticated user
 * @returns True if user should be redirected to home
 */
export function shouldRedirectToHome(user: User | null): boolean {
  return user?.role === 'user';
}

/**
 * Set authentication cookies for middleware
 */
export const setAuthCookies = async (user: FirebaseUser) => {
  try {
    const token = await user.getIdToken();
    const refreshToken = user.refreshToken;
    
    // Set auth token cookie (short-lived)
    document.cookie = `auth-token=${token}; path=/; max-age=3600; secure; samesite=strict`;
    
    // Set refresh token cookie (longer-lived)
    document.cookie = `refresh-token=${refreshToken}; path=/; max-age=604800; secure; samesite=strict`;
    
    return true;
  } catch (error) {
    console.error('Error setting auth cookies:', error);
    return false;
  }
};

/**
 * Clear authentication cookies
 */
export const clearAuthCookies = () => {
  document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

/**
 * Get auth token from cookies
 */
export const getAuthToken = (): string | null => {
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
  return authCookie ? authCookie.split('=')[1] : null;
};

/**
 * Get refresh token from cookies
 */
export const getRefreshToken = (): string | null => {
  const cookies = document.cookie.split(';');
  const refreshCookie = cookies.find(cookie => cookie.trim().startsWith('refresh-token='));
  return refreshCookie ? refreshCookie.split('=')[1] : null;
};

/**
 * Check if user is authenticated via cookies
 */
export const isAuthenticatedViaCookies = (): boolean => {
  return !!(getAuthToken() || getRefreshToken());
};

/**
 * Initialize auth state listener with cookie management
 */
export const initializeAuthWithCookies = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Set cookies when user is authenticated
      await setAuthCookies(user);
    } else {
      // Clear cookies when user is not authenticated
      clearAuthCookies();
    }
    
    callback(user);
  });
};

/**
 * Refresh auth token and update cookies
 */
export const refreshAuthToken = async (): Promise<boolean> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return false;
    }
    
    const token = await currentUser.getIdToken(true); // Force refresh
    document.cookie = `auth-token=${token}; path=/; max-age=3600; secure; samesite=strict`;
    
    return true;
  } catch (error) {
    console.error('Error refreshing auth token:', error);
    return false;
  }
};

/**
 * API wrapper that automatically refreshes tokens on expiration
 */
export const apiRequestWithAuth = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const makeRequest = async (token?: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    
    if (token) {
      headers.authorization = `Bearer ${token}`;
    }
    
    return fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
  };
  
  try {
    // First attempt with current token
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken(false); // Don't force refresh first
      const response = await makeRequest(token);
      
      // If successful, return response
      if (response.ok) {
        return response;
      }
      
      // If 401 or token expired, try refreshing
      if (response.status === 401) {
        const refreshedToken = await currentUser.getIdToken(true); // Force refresh
        document.cookie = `auth-token=${refreshedToken}; path=/; max-age=3600; secure; samesite=strict`;
        return makeRequest(refreshedToken);
      }
      
      return response;
    } else {
      // No user, make request without auth
      return makeRequest();
    }
  } catch (error) {
    console.error('API request with auth failed:', error);
    throw error;
  }
};
