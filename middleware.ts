import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/admin',
  '/admin/analytics',
  '/admin/audit',
  '/admin/blog',
  '/admin/calendar',
  '/admin/client-info',
  '/admin/content',
  '/admin/invoices',
  '/admin/leads',
  '/admin/payments',
  '/admin/resources',
  '/admin/testimonials',
];

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/onboarding',
  '/blog',
  '/content',
  '/resources',

  '/payment/success',
  '/payment/pending',
];

// Define API routes that require authentication
const protectedApiRoutes = [
  '/api/admin',
  '/api/analytics',
  '/api/audit',
  '/api/leads',
  '/api/payment/admin',
  '/api/invoice',
  '/api/content',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const isProtectedApiRoute = protectedApiRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // Get the auth token from cookies
  const authToken = request.cookies.get('auth-token')?.value;
  const refreshToken = request.cookies.get('refresh-token')?.value;
  
  // Check if user is authenticated
  const isAuthenticated = !!(authToken || refreshToken);

  // If authenticated but onboarding not completed, force redirect to /onboarding
  // Allow access to the onboarding page and API endpoints while checking
  const isOnboardingPath = pathname === '/onboarding' || pathname.startsWith('/onboarding/');
  const isApiPath = pathname.startsWith('/api/');
  if (isAuthenticated && !isOnboardingPath && !isApiPath) {
    // Call internal API to check onboarding status
    const url = new URL('/api/auth/check-onboarding', request.url);
    try {
      const resp = await fetch(url, {
        headers: authToken ? { authorization: `Bearer ${authToken}` } : undefined,
        cache: 'no-store',
      });
      if (resp.ok) {
        const data = await resp.json();
        // For Google users, if onboardingCompleted is undefined, assume they're existing users
        if (data && data.role !== 'admin' && data.onboardingCompleted === false) {
          return NextResponse.redirect(new URL('/onboarding', request.url));
        }
      }
    } catch (e) {
      // If check fails, do not block navigation; fail open
      console.warn('Middleware: onboarding check failed', e);
    }
  }
  
  // Handle protected routes
  if (isProtectedRoute || isProtectedApiRoute) {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // For API routes, we can also validate the token here
    if (isProtectedApiRoute && authToken) {
      // Add auth header for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('authorization', `Bearer ${authToken}`);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }
  
  // Handle public routes - redirect authenticated users away from auth pages
  if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
    // If onboarding not completed, send to onboarding instead of admin
    if (!isApiPath) {
      const url = new URL('/api/auth/check-onboarding', request.url);
      try {
        const resp = await fetch(url, {
          headers: authToken ? { authorization: `Bearer ${authToken}` } : undefined,
          cache: 'no-store',
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data && data.role !== 'admin' && data.onboardingCompleted === false) {
            return NextResponse.redirect(new URL('/onboarding', request.url));
          }
        }
      } catch {}
    }
    // Default redirect for authenticated users on auth pages
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  
  // Add security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com https://apis.google.com https://accounts.google.com https://assets.calendly.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob: https://firebasestorage.googleapis.com https://storage.googleapis.com",
    "connect-src 'self' https://api.stripe.com https://www.googleapis.com https://firestore.googleapis.com https://accounts.google.com https://oauth2.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://api.calendly.com https://auth.calendly.com https://firebasestorage.googleapis.com https://storage.googleapis.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://accounts.google.com https://*.firebaseapp.com https://calendly.com https://*.calendly.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
