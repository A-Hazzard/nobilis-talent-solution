import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <Card className="shadow-lg border-0">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
            </div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900">
              Loading...
            </h2>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Please wait while we prepare your content
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 