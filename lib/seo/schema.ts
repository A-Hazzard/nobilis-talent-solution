/**
 * Schema.org structured data implementation
 * Based on the comprehensive SEO implementation guide
 */

import { BUSINESS_INFO, SCHEMA_TYPES } from './config';

export function generateOrganizationSchema() {
  return SCHEMA_TYPES.organization;
}

export function generateProfessionalServiceSchema() {
  return SCHEMA_TYPES.professionalService;
}

export function generatePersonSchema(person: 'kareem' | 'jenifer') {
  return SCHEMA_TYPES.person[person];
}

export function generateServiceSchema(serviceName: string, description?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    description: description || `Professional ${serviceName} services by ${BUSINESS_INFO.name}`,
    provider: {
      '@type': 'Organization',
      name: BUSINESS_INFO.name,
      url: 'https://nobilis-talent-solutions.com',
    },
    serviceType: serviceName,
    areaServed: [
      'New York',
      'New York City',
      'United States',
    ],
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD',
      category: 'Professional Services',
    },
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateArticleSchema(article: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: BUSINESS_INFO.name,
      logo: {
        '@type': 'ImageObject',
        url: 'https://nobilis-talent-solutions.com/assets/logo.png',
      },
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    image: article.image || 'https://nobilis-talent-solutions.com/assets/hero.jpg',
    url: article.url,
  };
}

export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: BUSINESS_INFO.name,
    description: BUSINESS_INFO.description,
    url: 'https://nobilis-talent-solutions.com',
    telephone: BUSINESS_INFO.contact.phone,
    email: BUSINESS_INFO.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_INFO.address.street,
      addressLocality: BUSINESS_INFO.address.city,
      addressRegion: BUSINESS_INFO.address.state,
      postalCode: BUSINESS_INFO.address.zipCode,
      addressCountry: BUSINESS_INFO.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 40.7128,
      longitude: -74.0060,
    },
    openingHours: 'Mo-Fr 09:00-17:00',
    priceRange: '$$',
    paymentAccepted: 'Cash, Credit Card, Check',
    currenciesAccepted: 'USD',
    areaServed: [
      'New York',
      'New York City',
      'United States',
    ],
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 40.7128,
        longitude: -74.0060,
      },
      geoRadius: '100000', // 100km radius
    },
  };
}
