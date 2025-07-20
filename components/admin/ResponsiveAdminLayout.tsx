'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AuthGuard from '@/components/admin/AuthGuard';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface ResponsiveAdminLayoutProps {
  children: React.ReactNode;
}

export default function ResponsiveAdminLayout({ children }: ResponsiveAdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <div className="flex">
          {/* Sidebar */}
          <div className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
              <h2 className="text-lg font-semibold">Admin Panel</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <AdminSidebar />
          </div>
          
          {/* Main content */}
          <main className="flex-1 p-4 lg:p-6 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
} 