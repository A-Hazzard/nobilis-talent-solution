import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kareem Payne - Leadership Coaching & Consulting',
  description: 'Transform your leadership potential with Kareem Payne. Expert coaching for executives, teams, and organizations seeking breakthrough performance.',
  keywords: 'leadership coaching, executive coaching, team development, organizational consulting, Kareem Payne',
  authors: [{ name: 'Kareem Payne' }],
  creator: 'Kareem Payne',
  publisher: 'Kareem Payne Leadership Coaching',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://kareempayne.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://kareempayne.com',
    title: 'Kareem Payne - Leadership Coaching & Consulting',
    description: 'Transform your leadership potential with Kareem Payne. Expert coaching for executives, teams, and organizations seeking breakthrough performance.',
    siteName: 'Kareem Payne Leadership Coaching',
    images: [
      {
        url: '/assets/hero-leadership.jpg',
        width: 1200,
        height: 630,
        alt: 'Kareem Payne Leadership Coaching',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kareem Payne - Leadership Coaching & Consulting',
    description: 'Transform your leadership potential with Kareem Payne. Expert coaching for executives, teams, and organizations seeking breakthrough performance.',
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
          <Footer />
        </Providers>
      </body>
    </html>
  );
} 