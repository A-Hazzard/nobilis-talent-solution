import { User } from '@/shared/types/entities';

/**
 * Determines the appropriate redirect path based on user role, email verification, and onboarding status
 * @param user - The authenticated user
 * @returns The path to redirect to
 */
export function getRedirectPath(user: User | null): string {
  if (!user) {
    return '/';
  }

  // Check if user needs email verification (non-admin users only)
  if (user.role !== 'admin' && !user.emailVerified) {
    return '/verify-email';
  }

  // Check if user needs onboarding (non-admin users only)
  if (user.role !== 'admin' && !user.onboardingCompleted) {
    return '/onboarding';
  }

  // Admin users go to admin dashboard
  if (user.role === 'admin') {
    return '/admin';
  }

  // Regular users go to home page
  return '/';
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