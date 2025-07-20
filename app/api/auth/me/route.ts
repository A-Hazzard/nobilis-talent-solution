import { NextRequest, NextResponse } from 'next/server';
import { kindeConfig } from '@/lib/kinde';

export async function GET(request: NextRequest) {
  try {
    // Get the access token from cookies
    const accessToken = request.cookies.get('kinde_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get user profile from Kinde
    const userResponse = await fetch(`${kindeConfig.issuerUrl}/oauth2/v2/user_profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to get user profile' },
        { status: 401 }
      );
    }

    const user = await userResponse.json();
    
    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.given_name,
      lastName: user.family_name,
      picture: user.picture,
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return NextResponse.json(
      { error: 'Failed to get user profile' },
      { status: 500 }
    );
  }
} 