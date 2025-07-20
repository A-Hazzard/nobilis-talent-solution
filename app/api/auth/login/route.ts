import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { LoginRequest, LoginResponse } from '@/shared/types/api';

// Mock admin user for demo purposes
const ADMIN_USER = {
  id: '1',
  email: 'admin@payneleadership.com',
  name: 'Kareem Payne',
  role: 'admin' as const,
  createdAt: new Date(),
  isActive: true,
};

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Simple authentication for demo
    // In production, you would validate against a database
    if (email === ADMIN_USER.email && password === 'admin123') {
      const response: LoginResponse = {
        user: ADMIN_USER,
        token: 'mock-jwt-token',
      };

      // Set HTTP-only cookie
      const responseHeaders = new Headers();
      responseHeaders.append('Set-Cookie', `auth-token=${response.token}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}; Path=/`);

      return NextResponse.json(response, { headers: responseHeaders });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 