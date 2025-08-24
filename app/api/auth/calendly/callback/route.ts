import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('Calendly OAuth error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/admin/calendar?error=oauth_failed`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/admin/calendar?error=no_code`
    );
  }

  try {
    // Exchange authorization code for access token
    // Dynamically construct the redirect URI based on the request origin
    const requestOrigin = request.headers.get('origin') || request.headers.get('host');
    let redirectUri;
    
    if (requestOrigin) {
      if (requestOrigin.startsWith('http')) {
        // Already has protocol
        redirectUri = `${requestOrigin}/api/auth/calendly/callback`;
      } else {
        // No protocol, determine based on host
        const isLocalhost = requestOrigin.includes('localhost') || requestOrigin.includes('127.0.0.1');
        const protocol = isLocalhost ? 'http://' : 'https://';
        redirectUri = `${protocol}${requestOrigin}/api/auth/calendly/callback`;
      }
    } else {
      redirectUri = process.env.NEXT_PUBLIC_CALENDLY_REDIRECT_URI || 'http://localhost:3000/api/auth/calendly/callback';
    }
    
    console.log('🔗 Using redirect URI for token exchange:', redirectUri);
    console.log('🔍 Request origin:', requestOrigin);
    console.log('🔍 Request headers:', Object.fromEntries(request.headers.entries()));
    
    const tokenResponse = await fetch('https://auth.calendly.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.NEXT_PUBLIC_CALENDLY_CLIENT_ID!,
        client_secret: process.env.CALENDLY_CLIENT_SECRET!,
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Calendly token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        body: errorText
      });
      throw new Error(`Token exchange failed: ${tokenResponse.status} ${tokenResponse.statusText} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    
    // Store the access token (in a real app, you'd store this securely)
    // For now, we'll redirect with the token in the URL (not secure for production)
    const accessToken = tokenData.access_token;
    
    // Redirect back to calendar with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/admin/calendar?success=true&token=${accessToken}`
    );

  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/admin/calendar?error=token_exchange_failed`
    );
  }
} 