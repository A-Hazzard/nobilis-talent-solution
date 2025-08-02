'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';

type HeaderProps = {
  className?: string;
};

export default function Header({ className = '' }: HeaderProps) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  // Don't render header on admin pages
  if (isAdminPage) {
    return null;
  }

  return (
    <header className={className}>
      <Navigation />
    </header>
  );
} 