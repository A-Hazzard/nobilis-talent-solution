import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowLeft, Settings, LayoutDashboard } from 'lucide-react'

export default function AdminNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl font-bold text-orange-600">404</span>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Admin Page Not Found
            </CardTitle>
            <CardDescription className="text-gray-600">
              The admin page you're looking for doesn't exist. Please check the URL or navigate to a valid admin section.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Link href="/admin">
                <Button className="w-full" size="lg">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Go to Admin Dashboard
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center mb-3">
                Available Admin Pages:
              </p>
              <div className="space-y-2">
                <Link href="/admin/calendar">
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    📅 Calendar Management
                  </Button>
                </Link>
                <Link href="/admin/leads">
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    📊 Leads Management
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
                <Link href="/admin/settings">
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <Link href="/">
                <Button variant="ghost" className="w-full justify-start text-sm">
                  <Home className="w-4 h-4 mr-2" />
                  Return to Website
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 