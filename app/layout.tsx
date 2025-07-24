import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Payne Leadership - Executive Coaching & Leadership Development',
  description: 'Transform your leadership potential with expert executive coaching and leadership development programs.',
}

// Force dynamic rendering to prevent pre-rendering issues for all pages
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
} 