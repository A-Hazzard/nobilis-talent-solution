/**
 * SEO Configuration for Nobilis Talent Solutions
 * Based on the comprehensive SEO implementation guide
 */

export const SITE_CONFIG = {
  name: 'Nobilis Talent Solutions',
  url: 'https://nobilis-talent-solutions.com',
  domain: 'nobilis-talent-solutions.com',
  locale: 'en_US',
  defaultLanguage: 'en',
  supportedLanguages: ['en'],
  timezone: 'America/New_York',
};

export const BUSINESS_INFO = {
  name: 'Nobilis Talent Solutions',
  legalName: 'Nobilis Talent Solutions LLC',
  description: 'We help leaders, teams, and organizations unlock their potential, align culture with vision, and deliver sustainable results. Strategic leadership development and organizational transformation.',
  tagline: 'Where Strategy Meets Humanity',
  industry: 'Professional Services',
  category: 'Leadership Development & Organizational Consulting',
  founded: '2024',
  address: {
    street: '123 Business Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
  },
  contact: {
    phone: '+1 (555) 123-4567',
    email: 'info@nobilis-talent-solutions.com',
    website: 'https://nobilis-talent-solutions.com',
  },
  social: {
    linkedin: 'https://linkedin.com/company/nobilis-talent-solutions',
    instagram: 'https://instagram.com/nobilis_talent_solutions',
  },
  team: [
    {
      name: 'Kareem Payne',
      title: 'Founder & Chief Talent Strategist',
      role: 'Leadership Development Expert',
      bio: 'Kareem specializes in strategic leadership development and organizational transformation.',
    },
    {
      name: 'Jenifer Payne',
      title: 'Co-Founder & Lead Organizational Development Partner',
      role: 'Organizational Development Specialist',
      bio: 'Jenifer focuses on human resources and organizational development with expertise in Manufacturing, Media & Entertainment, and Consumer Packaging.',
    },
  ],
  services: [
    'Leadership Coaching',
    'Executive Coaching',
    'Team Development',
    'Organizational Consulting',
    'Talent Strategy',
    'Human Resources Consulting',
    'Organizational Development',
    'Culture Alignment',
    'Strategic Planning',
  ],
  achievements: {
    teamsTransformed: '200+',
    successRate: '100%',
    yearsExperience: '50+',
  },
};

export const SEO_KEYWORDS = {
  primary: [
    'leadership coaching',
    'executive coaching',
    'team development',
    'organizational consulting',
    'talent strategy',
    'human resources consulting',
    'organizational development',
    'leadership development',
    'strategic planning',
    'culture alignment',
  ],
  longTail: [
    'leadership coaching for executives',
    'team development programs',
    'organizational transformation consulting',
    'human resources strategy development',
    'leadership development training',
    'executive coaching services',
    'organizational culture alignment',
    'talent management consulting',
    'strategic leadership development',
    'team building workshops',
  ],
  local: [
    'leadership coaching New York',
    'executive coaching NYC',
    'organizational consulting New York',
    'team development New York',
    'human resources consulting NYC',
  ],
  question: [
    'how to develop leadership skills',
    'what is organizational development',
    'best leadership coaching programs',
    'how to align company culture',
    'what is executive coaching',
    'how to build effective teams',
    'leadership development strategies',
    'organizational transformation process',
  ],
};

export const SCHEMA_TYPES = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BUSINESS_INFO.name,
    legalName: BUSINESS_INFO.legalName,
    description: BUSINESS_INFO.description,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/assets/logo.png`,
    image: `${SITE_CONFIG.url}/assets/hero.jpg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_INFO.address.street,
      addressLocality: BUSINESS_INFO.address.city,
      addressRegion: BUSINESS_INFO.address.state,
      postalCode: BUSINESS_INFO.address.zipCode,
      addressCountry: BUSINESS_INFO.address.country,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: BUSINESS_INFO.contact.phone,
      contactType: 'customer service',
      email: BUSINESS_INFO.contact.email,
    },
    sameAs: [
      BUSINESS_INFO.social.linkedin,
      BUSINESS_INFO.social.instagram,
    ],
    founder: [
      {
        '@type': 'Person',
        name: 'Kareem Payne',
        jobTitle: 'Founder & Chief Talent Strategist',
      },
      {
        '@type': 'Person',
        name: 'Jenifer Payne',
        jobTitle: 'Co-Founder & Lead Organizational Development Partner',
      },
    ],
    service: BUSINESS_INFO.services.map(service => ({
      '@type': 'Service',
      name: service,
      provider: {
        '@type': 'Organization',
        name: BUSINESS_INFO.name,
      },
    })),
  },
  professionalService: {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: BUSINESS_INFO.name,
    description: BUSINESS_INFO.description,
    url: SITE_CONFIG.url,
    serviceType: 'Leadership Development & Organizational Consulting',
    areaServed: [
      'New York',
      'New York City',
      'United States',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Leadership Development Services',
      itemListElement: BUSINESS_INFO.services.map((service, index) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service,
        },
        position: index + 1,
      })),
    },
  },
  person: {
    kareem: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Kareem Payne',
      jobTitle: 'Founder & Chief Talent Strategist',
      description: 'Leadership Development Expert specializing in strategic leadership development and organizational transformation.',
      worksFor: {
        '@type': 'Organization',
        name: BUSINESS_INFO.name,
      },
      knowsAbout: [
        'Leadership Development',
        'Strategic Planning',
        'Organizational Transformation',
        'Executive Coaching',
        'Team Development',
      ],
    },
    jenifer: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Jenifer Payne',
      jobTitle: 'Co-Founder & Lead Organizational Development Partner',
      description: 'Organizational Development Specialist with expertise in Manufacturing, Media & Entertainment, and Consumer Packaging.',
      worksFor: {
        '@type': 'Organization',
        name: BUSINESS_INFO.name,
      },
      knowsAbout: [
        'Organizational Development',
        'Human Resources',
        'Manufacturing',
        'Media & Entertainment',
        'Consumer Packaging',
      ],
    },
  },
};

export const META_TAGS = {
  default: {
    title: `${BUSINESS_INFO.name} - ${BUSINESS_INFO.tagline}`,
    description: BUSINESS_INFO.description,
    keywords: SEO_KEYWORDS.primary.join(', '),
    author: 'Kareem Payne, Jenifer Payne',
    robots: 'index, follow',
    viewport: 'width=device-width, initial-scale=1',
    charset: 'utf-8',
  },
  openGraph: {
    type: 'website',
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: BUSINESS_INFO.name,
    title: `${BUSINESS_INFO.name} - ${BUSINESS_INFO.tagline}`,
    description: BUSINESS_INFO.description,
    image: `${SITE_CONFIG.url}/assets/hero.jpg`,
    imageWidth: 1200,
    imageHeight: 630,
    imageAlt: `${BUSINESS_INFO.name} - Leadership Development`,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nobilis_talent',
    creator: '@nobilis_talent',
    title: `${BUSINESS_INFO.name} - ${BUSINESS_INFO.tagline}`,
    description: BUSINESS_INFO.description,
    image: `${SITE_CONFIG.url}/assets/hero.jpg`,
  },
  local: {
    'geo.region': 'US-NY',
    'geo.placename': 'New York',
    'geo.position': '40.7128;-74.0060',
    'ICBM': '40.7128, -74.0060',
  },
};
