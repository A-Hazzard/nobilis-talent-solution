'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/lib/stores/userStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initializeAuth } = useUserStore();

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    const unsubscribe = initializeAuth();

    return () => {
      console.log('AuthProvider: Cleaning up auth state listener');
      unsubscribe();
    };
  }, [initializeAuth]);

  return <>{children}</>;
}

// Export the hook for backward compatibility
export { useUserStore as useAuth }; 