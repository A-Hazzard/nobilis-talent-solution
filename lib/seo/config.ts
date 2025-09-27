/**
 * SEO Configuration for Nobilis Talent Solutions
 * Based on the comprehensive SEO implementation guide
 */

export const SITE_CONFIG = {
  name: 'Nobilis Talent Solutions',
  url: 'https://nobilistalent.com',
  domain: 'nobilistalent.com',
  locale: 'en_US',
  defaultLanguage: 'en',
  supportedLanguages: ['en'],
  timezone: 'America/New_York',
};

export const BUSINESS_INFO = {
  name: 'Nobilis Talent Solutions',
  legalName: 'Nobilis Talent Solutions LLC',
  description: 'We help leaders, teams, and organizations unlock their potential, align culture with vision, and deliver sustainable results. Strategic talent management solutions and organizational transformation.',
  tagline: 'Where Strategy Meets Humanity',
  industry: 'Professional Services',
  category: 'Leadership Development & Organizational Consulting',
  founded: '2025',
  address: {
    street: '3344 Cobb Parkway, STE 200',
    city: 'Acworth',
    state: 'GA',
    zipCode: '30101',
    country: 'United States',
  },
  contact: {
    phone: '(678) 956-1146',
    email: 'support@nobilistalent.com',
    website: 'https://nobilistalent.com',
  },
  social: {
    linkedin: 'https://www.linkedin.com/company/nobilis-talent-solutions/',
    instagram: 'https://www.instagram.com/nobilis.talent',
  },
  team: [
    {
      name: 'Kareem Payne',
      title: 'Founder & Chief Talent Strategist',
      role: 'Talent Management Expert',
      bio: 'Kareem specializes in strategic talent management solutions and organizational transformation.',
    },
    {
      name: 'Jennifer Payne',
      title: 'Co-Founder & Lead Organizational Development Partner',
      role: 'Organizational Development Specialist',
      bio: 'Jennifer focuses on human resources and organizational development with expertise in Manufacturing, Media & Entertainment, and Consumer Packaging.',
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
    'talent management solutions',
    'strategic planning',
    'culture alignment',
  ],
  longTail: [
    'leadership coaching for executives',
    'team development programs',
    'organizational transformation consulting',
    'human resources strategy development',
    'talent management training',
    'executive coaching services',
    'organizational culture alignment',
    'talent management consulting',
    'strategic leadership development',
    'team building workshops',
  ],
  local: [
    'leadership coaching Georgia',
    'executive coaching Atlanta',
    'organizational consulting Georgia',
    'team development Georgia',
    'human resources consulting Atlanta',
  ],
  question: [
    'how to develop leadership skills',
    'what is organizational development',
    'best leadership coaching programs',
    'how to align company culture',
    'what is executive coaching',
    'how to build effective teams',
    'talent management strategies',
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
    logo: `${SITE_CONFIG.url}/assets/og-image.png`,
    image: `${SITE_CONFIG.url}/assets/og-image.png`,
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
        name: 'Jennifer Payne',
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
      'Georgia',
      'Acworth',
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
      description: 'Talent Management Expert specializing in strategic talent management solutions and organizational transformation.',
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
    jennifer: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Jennifer Payne',
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
    author: 'Kareem Payne, Jennifer Payne',
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
    image: `${SITE_CONFIG.url}/assets/og-image.png`,
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
    'geo.region': 'US-GA',
    'geo.placename': 'Acworth',
    'geo.position': '34.0659;-84.6769',
    'ICBM': '34.0659, -84.6769',
  },
};
