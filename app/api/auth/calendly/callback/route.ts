import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    console.log('🔄 Calendly OAuth callback received:', { code: !!code, state });

    if (!code) {
      console.error('❌ No authorization code received');
      return NextResponse.redirect(`${getBaseUrl()}/admin/calendar?error=no_code`);
    }

    console.log('🔄 Exchanging code for access token...');

    // Exchange code for access token
    const tokenResponse = await fetch('https://auth.calendly.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.NEXT_PUBLIC_CALENDLY_CLIENT_ID || '',
        client_secret: process.env.CALENDLY_CLIENT_SECRET || '',
        redirect_uri: `${getBaseUrl()}/api/auth/calendly/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Calendly token exchange failed:', errorText);
      return NextResponse.redirect(`${getBaseUrl()}/admin/calendar?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Token exchange successful');

    // Pass the token in the URL so the frontend can store it
    const accessToken = tokenData.access_token;
    
    if (!accessToken) {
      console.error('❌ No access token in response');
      return NextResponse.redirect(`${getBaseUrl()}/admin/calendar?error=no_token`);
    }

    // Redirect back to calendar with success and token
    return NextResponse.redirect(`${getBaseUrl()}/admin/calendar?success=true&token=${accessToken}`);

  } catch (error) {
    console.error('❌ Calendly callback error:', error);
    return NextResponse.redirect(`${getBaseUrl()}/admin/calendar?error=callback_failed`);
  }
} 