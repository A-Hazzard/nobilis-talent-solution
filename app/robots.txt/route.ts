/**
 * Dynamic robots.txt generation
 * Based on the comprehensive SEO implementation guide
 */

import { generateRobotsTxt } from '@/lib/seo/sitemap';

export async function GET() {
  const robotsTxt = generateRobotsTxt();
  
  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
