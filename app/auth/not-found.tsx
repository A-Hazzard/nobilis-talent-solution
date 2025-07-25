'use client';

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowLeft, LogIn, UserPlus } from 'lucide-react'

export default function AuthNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl font-bold text-blue-600">404</span>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Authentication Page Not Found
            </CardTitle>
            <CardDescription className="text-gray-600">
              The authentication page you're looking for doesn't exist. Please use one of the available authentication options.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Link href="/login">
                <Button className="w-full" size="lg">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              
              <Link href="/signup">
                <Button variant="outline" className="w-full" size="lg">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </Button>
              </Link>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center mb-3">
                Need help with authentication?
              </p>
              <div className="space-y-2">
                <Link href="/#contact">
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    📧 Contact Support
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <Link href="/">
                <Button variant="ghost" className="w-full justify-start text-sm">
                  <Home className="w-4 h-4 mr-2" />
                  Return to Homepage
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 