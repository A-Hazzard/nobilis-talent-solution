'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">You don't have permission to access the admin dashboard.</p>
        <div className="flex items-center justify-center space-x-3">
          <Link href="/" className="btn-outline">Go Home</Link>
          <Link href="/login" className="btn-primary">Login</Link>
        </div>
      </div>
    </div>
  );
}

