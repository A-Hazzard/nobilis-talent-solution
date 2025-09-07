import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import ConditionalFooter from '@/components/ConditionalFooter';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { META_TAGS, SITE_CONFIG } from '@/lib/seo/config';
import { generateOrganizationSchema, generateProfessionalServiceSchema } from '@/lib/seo/schema';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: META_TAGS.default.title,
  description: META_TAGS.default.description,
  keywords: META_TAGS.default.keywords,
  authors: [{ name: 'Kareem Payne' }, { name: 'Jenifer Payne' }],
  creator: 'Nobilis Talent Solutions',
  publisher: 'Nobilis Talent Solutions',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(SITE_CONFIG.url),
  alternates: {
    canonical: '/',
  },
  openGraph: META_TAGS.openGraph,
  twitter: META_TAGS.twitter,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  other: {
    ...META_TAGS.local,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationSchema = generateOrganizationSchema();
  const professionalServiceSchema = generateProfessionalServiceSchema();

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(professionalServiceSchema),
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <ConditionalFooter />
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
} 