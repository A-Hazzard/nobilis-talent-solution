'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only check if we're on a protected route and not already authenticated
    if (!isLoading && !isAuthenticated && pathname.startsWith('/admin')) {
      router.push('/login');
      return;
    }

    // Check admin role for admin routes
    if (!isLoading && isAuthenticated && user && pathname.startsWith('/admin') && user.role !== 'admin') {
      router.push('/access-denied');
      return;
    }

    setIsChecking(false);
  }, [isLoading, isAuthenticated, user, router, pathname]);

  // Show loading spinner only briefly while checking
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and on a protected route, middleware will handle redirect
  if (!isAuthenticated && pathname.startsWith('/admin')) {
    return null;
  }

  // If authenticated but not admin on admin routes, show access denied
  if (isAuthenticated && user && pathname.startsWith('/admin') && user.role !== 'admin') {
    return null; // Will redirect to access denied
  }

  return <>{children}</>;
} 