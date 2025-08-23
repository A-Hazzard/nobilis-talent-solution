'use client';

import { useBreadcrumbs } from '@/lib/hooks/useBreadcrumbs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { Fragment } from 'react';

export function Breadcrumbs() {
  const breadcrumbs = useBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
<Breadcrumb className="mb-4 sm:mb-6">
  <BreadcrumbList className="flex flex-wrap items-center gap-1 sm:gap-2">
    {breadcrumbs.map((crumb, index) => (
      <Fragment key={crumb.href}>
        <BreadcrumbItem className="inline-flex items-center whitespace-nowrap leading-none min-w-0">
          {crumb.isCurrent ? (
            <BreadcrumbPage className="text-xs sm:text-sm inline-flex items-center font-medium truncate max-w-[120px] sm:max-w-[200px] lg:max-w-none">
              {crumb.label}
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link
                href={crumb.href}
                className="text-xs sm:text-sm inline-flex items-center truncate min-w-0 max-w-[120px] sm:max-w-[200px] lg:max-w-none hover:text-primary transition-colors"
              >
                {crumb.label}
              </Link>
            </BreadcrumbLink>
          )}

          {index < breadcrumbs.length - 1 && (
            <BreadcrumbSeparator
              className="mx-1 sm:mx-2 shrink-0 text-xs sm:text-sm align-middle leading-none"
            />
          )}
        </BreadcrumbItem>
      </Fragment>
    ))}
  </BreadcrumbList>
</Breadcrumb>

  );
}
