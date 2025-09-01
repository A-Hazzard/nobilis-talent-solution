import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import ConditionalFooter from '@/components/ConditionalFooter';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nobilis Talent Solutions - Where Strategy Meets Humanity',
  description: 'We help leaders, teams, and organizations unlock their potential, align culture with vision, and deliver sustainable results. Strategic leadership development and organizational transformation.',
  keywords: 'leadership coaching, executive coaching, team development, organizational consulting, talent strategy, human resources, organizational development, Kareem Payne, Jenifer Payne',
  authors: [{ name: 'Kareem Payne' }, { name: 'Jenifer Payne' }],
  creator: 'Nobilis Talent Solutions',
  publisher: 'Nobilis Talent Solutions',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://nobilis-talent-solutions.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nobilis-talent-solutions.com',
    title: 'Nobilis Talent Solutions - Where Strategy Meets Humanity',
    description: 'We help leaders, teams, and organizations unlock their potential, align culture with vision, and deliver sustainable results. Strategic leadership development and organizational transformation.',
    siteName: 'Nobilis Talent Solutions',
    images: [
      {
        url: '/assets/hero-leadership.jpg',
        width: 1200,
        height: 630,
        alt: 'Nobilis Talent Solutions - Leadership Development',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nobilis Talent Solutions - Where Strategy Meets Humanity',
    description: 'We help leaders, teams, and organizations unlock their potential, align culture with vision, and deliver sustainable results.',
    images: ['/assets/hero-leadership.jpg'],
  },
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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