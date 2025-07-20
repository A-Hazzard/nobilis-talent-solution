import type { Metadata } from 'next';
import ResponsiveAdminLayout from '@/components/admin/ResponsiveAdminLayout';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Payne Leadership',
  description: 'Admin dashboard for managing leads, resources, and analytics',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ResponsiveAdminLayout>{children}</ResponsiveAdminLayout>;
} 