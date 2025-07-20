import { NextRequest, NextResponse } from 'next/server';
import { kindeConfig } from '@/lib/kinde';

export async function POST(request: NextRequest) {
  try {
    // Get the refresh token from cookies
    const refreshToken = request.cookies.get('kinde_refresh_token')?.value;
    
    // If we have a refresh token, try to revoke it with Kinde
    if (refreshToken) {
      try {
        await fetch(`${kindeConfig.issuerUrl}/oauth2/revoke`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: kindeConfig.clientId,
            client_secret: kindeConfig.clientSecret,
            token: refreshToken,
          }),
        });
      } catch (error) {
        console.error('Error revoking token:', error);
        // Continue with logout even if token revocation fails
      }
    }
    
    // Create response with cleared cookies
    const response = NextResponse.json({ success: true });
    
    // Clear authentication cookies
    response.cookies.set('kinde_access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
    });

    response.cookies.set('kinde_refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
    });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
} 