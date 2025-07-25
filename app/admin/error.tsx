'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, RefreshCw, Shield } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Admin section error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Admin Dashboard Error
            </CardTitle>
            <CardDescription className="text-gray-600">
              We encountered an issue while loading the admin dashboard. Please try again or contact support if the problem persists.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button 
                onClick={reset}
                className="w-full" 
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Dashboard
              </Button>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center mb-3">
                Quick Navigation:
              </p>
              <div className="space-y-2">
                <Link href="/admin/calendar">
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    📅 Calendar
                  </Button>
                </Link>
                <Link href="/admin/leads">
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    📊 Leads
                  </Button>
                </Link>
                <Link href="/admin/testimonials">
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    💬 Testimonials
                  </Button>
                </Link>
                <Link href="/admin/resources">
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    📚 Resources
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <Link href="/">
                <Button variant="ghost" className="w-full justify-start text-sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Website
                </Button>
              </Link>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="pt-4 border-t border-gray-200">
                <details className="text-sm">
                  <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto">
                    <div className="mb-2">
                      <strong>Message:</strong> {error.message}
                    </div>
                    {error.digest && (
                      <div className="mb-2">
                        <strong>Digest:</strong> {error.digest}
                      </div>
                    )}
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{error.stack}</pre>
                    </div>
                  </div>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 