'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import logo from '@/public/assets/logo-transparent.png';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calendar, 
  MessageSquare, 
  BarChart3,
  Receipt,
  Activity
} from 'lucide-react';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'Leads',
    href: '/admin/leads',
    icon: Users,
  },
  {
    title: 'Content',
    href: '/admin/blog',
    icon: FileText,
  },
  {
    title: 'Calendar',
    href: '/admin/calendar',
    icon: Calendar,
  },
  {
    title: 'Testimonials',
    href: '/admin/testimonials',
    icon: MessageSquare,
  },
  {
    title: 'Invoices',
    href: '/admin/invoices',
    icon: Receipt,
  },
  {
    title: 'Audit Logs',
    href: '/admin/audit',
    icon: Activity,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
        <Image src={logo} alt="Nobilis Talent Solutions" width={40} height={40} />
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out transform hover:scale-105',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 