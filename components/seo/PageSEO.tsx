/**
 * Comprehensive SEO component for individual pages
 * Based on the comprehensive SEO implementation guide
 */

import Head from 'next/head';
import { generateServiceSchema, generateBreadcrumbSchema, generateFAQSchema, generateArticleSchema } from '@/lib/seo/schema';

interface PageSEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'service' | 'profile';
  breadcrumbs?: Array<{ name: string; url: string }>;
  faqs?: Array<{ question: string; answer: string }>;
  article?: {
    title: string;
    description: string;
    author: string;
    datePublished: string;
    dateModified?: string;
    image?: string;
    url: string;
  };
  service?: {
    name: string;
    description?: string;
  };
  noindex?: boolean;
  nofollow?: boolean;
}

export default function PageSEO({
  title,
  description,
  keywords = [],
  image = '/assets/hero.jpg',
  url,
  type = 'website',
  breadcrumbs,
  faqs,
  article,
  service,
  noindex = false,
  nofollow = false,
}: PageSEOProps) {
  const fullTitle = title ? `${title} - Nobilis Talent Solutions` : 'Nobilis Talent Solutions - Where Strategy Meets Humanity';
  const fullDescription = description || 'We help leaders, teams, and organizations unlock their potential, align culture with vision, and deliver sustainable results. Strategic leadership development and organizational transformation.';
  const fullUrl = url ? `https://nobilis-talent-solutions.com${url}` : 'https://nobilis-talent-solutions.com';
  const fullImage = image.startsWith('http') ? image : `https://nobilis-talent-solutions.com${image}`;

  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
  ].join(', ');

  // Generate structured data
  const structuredData = [];

  if (breadcrumbs) {
    structuredData.push(generateBreadcrumbSchema(breadcrumbs));
  }

  if (faqs) {
    structuredData.push(generateFAQSchema(faqs));
  }

  if (article) {
    structuredData.push(generateArticleSchema(article));
  }

  if (service) {
    structuredData.push(generateServiceSchema(service.name, service.description));
  }

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content="Nobilis Talent Solutions" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {/* Local SEO */}
      <meta name="geo.region" content="US-NY" />
      <meta name="geo.placename" content="New York" />
      <meta name="geo.position" content="40.7128;-74.0060" />
      <meta name="ICBM" content="40.7128, -74.0060" />

      {/* Structured Data */}
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data),
          }}
        />
      ))}
    </Head>
  );
}
