/**
 * Dynamic XML Sitemap generation
 * Based on the comprehensive SEO implementation guide
 */

import { generateSitemap } from '@/lib/seo/sitemap';

export async function GET() {
  // In a real implementation, you would fetch dynamic pages from your database
  // For now, we'll use the static pages defined in the sitemap config
  
  const sitemap = generateSitemap();
  
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
