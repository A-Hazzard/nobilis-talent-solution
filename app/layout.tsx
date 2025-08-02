import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Payne Leadership - Executive Coaching & Leadership Development',
  description: 'Transform your leadership potential with Kareem Payne. Expert executive coaching, leadership development, and organizational consulting to help you and your team achieve breakthrough results.',
  keywords: 'executive coaching, leadership development, organizational consulting, business strategy, team building, leadership training, executive mentoring, professional development',
  authors: [{ name: 'Kareem Payne' }],
  creator: 'Kareem Payne',
  publisher: 'Payne Leadership',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://payneleadership.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Payne Leadership - Executive Coaching & Leadership Development',
    description: 'Transform your leadership potential with Kareem Payne. Expert executive coaching, leadership development, and organizational consulting.',
    url: 'https://payneleadership.com',
    siteName: 'Payne Leadership',
    images: [
      {
        url: '/assets/hero-leadership.jpg',
        width: 1200,
        height: 630,
        alt: 'Payne Leadership - Executive Coaching',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Payne Leadership - Executive Coaching & Leadership Development',
    description: 'Transform your leadership potential with Kareem Payne. Expert executive coaching, leadership development, and organizational consulting.',
    images: ['/assets/hero-leadership.jpg'],
    creator: '@kareempayne',
    site: '@payneleadership',
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
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <SEO />
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
} 