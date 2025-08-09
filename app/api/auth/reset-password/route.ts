import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/config';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Missing token or password' }, { status: 400 });
    }

    // If using Firebase action codes
    try {
      // Verify code and reset
      await verifyPasswordResetCode(auth, token);
      await confirmPasswordReset(auth, token, password);

      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
