'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type Breadcrumb = {
  label: string;
  href: string;
  isCurrent: boolean;
};

export function useBreadcrumbs(): Breadcrumb[] {
  const pathname = usePathname();

  return useMemo(() => {
    const pathSegments = pathname.split('/').filter(segment => segment);
    const breadcrumbs: Breadcrumb[] = [{ label: 'Home', href: '/', isCurrent: pathname === '/' }];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isCurrent = index === pathSegments.length - 1;
      
      // Capitalize the first letter and replace hyphens with spaces for the label
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

      breadcrumbs.push({
        label,
        href: currentPath,
        isCurrent,
      });
    });

    return breadcrumbs;
  }, [pathname]);
}
