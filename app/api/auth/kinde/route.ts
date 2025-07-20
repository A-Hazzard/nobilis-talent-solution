import { NextRequest, NextResponse } from 'next/server';
import { kindeConfig } from '@/lib/kinde';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(`${kindeConfig.issuerUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: kindeConfig.clientId,
        client_secret: kindeConfig.clientSecret,
        code,
        redirect_uri: `${kindeConfig.siteUrl}/api/auth/kinde`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();
    
    // Get user profile
    const userResponse = await fetch(`${kindeConfig.issuerUrl}/oauth2/v2/user_profile`, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user profile');
    }

    const user = await userResponse.json();
    
    // Set cookies for authentication
    const response = NextResponse.redirect(new URL('/admin', request.url));
    
    response.cookies.set('kinde_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    if (tokens.refresh_token) {
      response.cookies.set('kinde_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error('Kinde authentication error:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
} 