import { NextRequest, NextResponse } from 'next/server';
import type { LoginRequest, LoginResponse } from '@/shared/types/api';
import { AuthService } from '@/lib/services/AuthService';
import type { User } from '@/shared/types/entities';
import { logAdminLogin } from '@/lib/utils/auditUtils';
import { logAdminAction } from '@/lib/helpers/auditLogger';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    const authService = AuthService.getInstance();
    const { user: firebaseUser, error } = await authService.signInWithEmail(email, password);

    if (error || !firebaseUser) {
      return NextResponse.json(
        { success: false, error: error?.message || 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Fetch user profile from Firestore
    const userProfile = await authService.getUserProfile(firebaseUser.uid);
    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Map to User type
    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      phone: userProfile.phone,
      organization: userProfile.organization,
      role: firebaseUser.uid === 'wG2jJtLiFCOaRF6jZ2DMo8u8yAh1' ? 'admin' : (userProfile.role || 'user'),
      createdAt: userProfile.createdAt,
      lastLoginAt: new Date(firebaseUser.metadata.lastSignInTime || Date.now()),
      isActive: userProfile.isActive,
    };

    // TODO: Generate a real JWT token if needed, for now just return a placeholder
    const token = 'real-jwt-token';

    // Set HTTP-only cookie
    const responseHeaders = new Headers();
    responseHeaders.append('Set-Cookie', `auth-token=${token}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}; Path=/`);

    const response: LoginResponse = {
      user,
      token,
    };

    // Log admin login for audit (with IP and user agent)
    if (user.role === 'admin') {
      const ipAddress = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      await logAdminLogin(ipAddress, userAgent);
      
      // Also log to our new audit system
      await logAdminAction({
        userId: user.id,
        userEmail: user.email,
        action: 'login',
        entity: 'auth',
        details: { ipAddress, userAgent },
        timestamp: Date.now(),
      });
    }

    return NextResponse.json(response, { headers: responseHeaders });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 