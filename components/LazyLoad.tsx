'use client';

import { Suspense, lazy, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * LazyLoad wrapper component for better performance
 */
export function LazyLoad({ children, fallback }: LazyLoadProps) {
  return (
    <Suspense fallback={fallback || <Skeleton className="w-full h-32" />}>
      {children}
    </Suspense>
  );
}

/**
 * Create a lazy-loaded component with custom fallback
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <LazyLoad fallback={fallback}>
        <LazyComponent {...props} />
      </LazyLoad>
    );
  };
}

/**
 * Predefined lazy components for common use cases
 */
export const LazyHeroSection = createLazyComponent(
  () => import('./HeroSection'),
  <Skeleton className="w-full h-screen" />
);

export const LazyContactSection = createLazyComponent(
  () => import('./ContactSection'),
  <Skeleton className="w-full h-96" />
);

export const LazyServicesSection = createLazyComponent(
  () => import('./ServicesSection'),
  <Skeleton className="w-full h-96" />
);

export const LazyTestimonialsSection = createLazyComponent(
  () => import('./TestimonialsSection'),
  <Skeleton className="w-full h-96" />
);

export const LazyAboutSection = createLazyComponent(
  () => import('./AboutSection'),
  <Skeleton className="w-full h-96" />
);

export const LazyContentSection = createLazyComponent(
  () => import('./ContentSection'),
  <Skeleton className="w-full h-96" />
);

export const LazyResourceDownloadModal = createLazyComponent(
  () => import('./ResourceDownloadModal'),
  <Skeleton className="w-full h-64" />
);

export const LazyInvoicePreviewModal = createLazyComponent(
  () => import('./InvoicePreviewModal'),
  <Skeleton className="w-full h-64" />
); 