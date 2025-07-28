'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Star,
  PenTool,
  Activity,
} from 'lucide-react';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Leads',
    href: '/admin/leads',
    icon: Users,
  },
  {
    title: 'Resources',
    href: '/admin/resources',
    icon: FileText,
  },
  {
    title: 'Content', // Renamed from 'Blog'
    href: '/admin/blog',
    icon: PenTool,
  },
  {
    title: 'Testimonials',
    href: '/admin/testimonials',
    icon: Star,
  },
  {
    title: 'Calendar',
    href: '/admin/calendar',
    icon: Calendar,
  },
  {
    title: 'Audit',
    href: '/admin/audit',
    icon: Activity,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="pb-12 min-h-screen">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight hidden lg:block">
            Admin Panel
          </h2>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start text-sm lg:text-base',
                  pathname === item.href && 'bg-secondary'
                )}
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 