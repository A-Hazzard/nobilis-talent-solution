import type { Metadata } from 'next';
import ResponsiveAdminLayout from '@/components/admin/ResponsiveAdminLayout';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Nobilis Talent Solutions',
  description: 'Admin dashboard for managing leads, resources, and analytics',
};

// Force dynamic rendering to prevent pre-rendering issues for all admin pages
export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ResponsiveAdminLayout>{children}</ResponsiveAdminLayout>;
} 