import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  structuredData?: object;
}

/**
 * Comprehensive SEO component for better search engine optimization
 */
export default function SEO({
  title = 'Nobilis Talent Solutions — Where strategy meets humanity',
  description = 'Helping People and Organizations Thrive. Human Capital Alchemist and Coach helping leaders and teams unlock potential, navigate change, and build cultures where people and performance flourish.',
  keywords = 'executive coaching, leadership development, organizational consulting, business strategy, team building, leadership training, executive mentoring, professional development, human capital, talent solutions',
  image = '/assets/hero-leadership.jpg',
  url = 'https://payneleadership.com',
  type = 'website',
  author = 'Kareem Payne',
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  structuredData,
}: SEOProps) {
  const fullTitle = title.includes('Nobilis Talent Solutions') ? title : `${title} | Nobilis Talent Solutions`;
  const fullUrl = url.startsWith('http') ? url : `https://payneleadership.com${url}`;
  const fullImage = image.startsWith('http') ? image : `https://payneleadership.com${image}`;

  // Default structured data for organization
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Nobilis Talent Solutions',
    url: 'https://payneleadership.com',
    logo: 'https://payneleadership.com/logo-transparent.png',
    description: 'Human Capital Alchemist and Coach helping leaders and teams unlock potential, navigate change, and build cultures where people and performance flourish.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-678-920-6605',
      contactType: 'customer service',
      email: 'nobilis.talent@gmail.com'
    },
    sameAs: [
      'https://linkedin.com/company/nobilis-talent-solutions',
      'https://twitter.com/nobilistalent'
    ]
  };

  // Person structured data for Kareem Payne
  const personStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Kareem T. Payne',
    jobTitle: 'Human Capital Alchemist & Coach',
    worksFor: {
      '@type': 'Organization',
      name: 'Nobilis Talent Solutions'
    },
    description: 'Purposeful, passionate, and results-driven Human Capital Alchemist & Coach with experience across diverse sectors.',
    image: 'https://payneleadership.com/assets/kareem-profile.jpg',
    url: 'https://payneleadership.com',
    sameAs: [
      'https://linkedin.com/in/kareempayne',
      'https://twitter.com/kareempayne'
    ]
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Payne Leadership" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@payneleadership" />
      <meta name="twitter:creator" content="@kareempayne" />
      
      {/* Additional Meta Tags for Articles */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Favicon and App Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#667eea" />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://images.unsplash.com" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData || defaultStructuredData)
        }}
      />
      
      {/* Person structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personStructuredData)
        }}
      />
      
      {/* Service structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Executive Coaching',
            provider: {
              '@type': 'Organization',
              name: 'Payne Leadership'
            },
            description: 'Professional executive coaching services to enhance leadership skills and organizational performance',
            areaServed: 'United States',
            serviceType: 'Executive Coaching',
            category: 'Professional Services'
          })
        }}
      />
    </Head>
  );
}

/**
 * SEO component for specific pages
 */
export function PageSEO({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  ...props 
}: SEOProps) {
  return (
    <SEO
      title={title}
      description={description}
      keywords={keywords}
      image={image}
      url={url}
      type={type}
      {...props}
    />
  );
}

/**
 * SEO component for blog articles
 */
export function BlogSEO({ 
  title, 
  description, 
  image, 
  url, 
  author = 'Kareem Payne',
  publishedTime,
  modifiedTime,
  tags = [],
  ...props 
}: SEOProps) {
  return (
    <SEO
      title={title}
      description={description}
      image={image}
      url={url}
      type="article"
      author={author}
      publishedTime={publishedTime}
      modifiedTime={modifiedTime}
      tags={tags}
      structuredData={{
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description: description,
        image: image,
        author: {
          '@type': 'Person',
          name: author
        },
        publisher: {
          '@type': 'Organization',
          name: 'Payne Leadership',
          logo: {
            '@type': 'ImageObject',
            url: 'https://payneleadership.com/logo-transparent.png'
          }
        },
        datePublished: publishedTime,
        dateModified: modifiedTime || publishedTime,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': url
        }
      }}
      {...props}
    />
  );
} 