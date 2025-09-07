/**
 * XML Sitemap generation for SEO
 * Based on the comprehensive SEO implementation guide
 */

import { SITE_CONFIG } from './config';

export interface SitemapEntry {
  url: string;
  lastModified?: string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const STATIC_PAGES: SitemapEntry[] = [
  {
    url: '/',
    changeFrequency: 'weekly',
    priority: 1.0,
  },
  {
    url: '/about',
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: '/services',
    changeFrequency: 'monthly',
    priority: 0.9,
  },
  {
    url: '/contact',
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: '/content',
    changeFrequency: 'weekly',
    priority: 0.7,
  },
  {
    url: '/testimonials',
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    url: '/privacy-policy',
    changeFrequency: 'yearly',
    priority: 0.3,
  },
  {
    url: '/terms-of-service',
    changeFrequency: 'yearly',
    priority: 0.3,
  },
  {
    url: '/login',
    changeFrequency: 'yearly',
    priority: 0.2,
  },
  {
    url: '/signup',
    changeFrequency: 'yearly',
    priority: 0.2,
  },
];

export function generateSitemap(additionalPages: SitemapEntry[] = []): string {
  const allPages = [...STATIC_PAGES, ...additionalPages];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${SITE_CONFIG.url}${page.url}</loc>
    ${page.lastModified ? `    <lastmod>${page.lastModified}</lastmod>` : ''}
    ${page.changeFrequency ? `    <changefreq>${page.changeFrequency}</changefreq>` : ''}
    ${page.priority ? `    <priority>${page.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
}

export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${SITE_CONFIG.url}/sitemap.xml

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /onboarding/
Disallow: /profile/
Disallow: /payment/

# Allow important pages
Allow: /content/
Allow: /blog/
Allow: /resources/`;
}
