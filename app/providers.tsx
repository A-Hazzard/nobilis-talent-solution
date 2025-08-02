'use client';

import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
} 