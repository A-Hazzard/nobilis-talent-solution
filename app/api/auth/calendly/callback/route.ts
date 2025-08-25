import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.redirect(`${getBaseUrl()}/auth?error=no_code`);
    }

    // Validate state parameter if needed
    if (state && state !== 'your-state-validation') {
      return NextResponse.redirect(`${getBaseUrl()}/auth?error=invalid_state`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://auth.calendly.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.CALENDLY_CLIENT_ID || '',
        client_secret: process.env.CALENDLY_CLIENT_SECRET || '',
        redirect_uri: `${getBaseUrl()}/api/auth/calendly/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Calendly token exchange failed:', await tokenResponse.text());
      return NextResponse.redirect(`${getBaseUrl()}/auth?error=token_exchange_failed`);
    }

    // Store the access token securely (you might want to store this in your database)
    // For now, we'll redirect to success
    return NextResponse.redirect(`${getBaseUrl()}/auth?success=true&provider=calendly`);

  } catch (error) {
    console.error('Calendly callback error:', error);
    return NextResponse.redirect(`${getBaseUrl()}/auth?error=callback_failed`);
  }
} 