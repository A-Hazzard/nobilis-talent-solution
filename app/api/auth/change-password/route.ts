import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/helpers/auth';
import { auth } from '@/lib/firebase/config';
import { signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { validatePassword } from '@/lib/utils/validation';

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Check authentication
    const authResult = await getAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.error || 'Password does not meet requirements' },
        { status: 400 }
      );
    }

    // Verify current password by attempting to sign in
    try {
      await signInWithEmailAndPassword(auth, authResult.user.email, currentPassword);
    } catch (error: any) {
      console.error('Password verification error:', error);
      if (error.code === 'auth/wrong-password') {
        return NextResponse.json(
          { error: 'The current password you entered is incorrect. Please check your password and try again.' },
          { status: 400 }
        );
      }
      if (error.code === 'auth/user-not-found') {
        return NextResponse.json(
          { error: 'User account not found. Please contact support.' },
          { status: 400 }
        );
      }
      if (error.code === 'auth/too-many-requests') {
        return NextResponse.json(
          { error: 'Too many failed attempts. Please wait a few minutes before trying again.' },
          { status: 400 }
        );
      }
      if (error.code === 'auth/invalid-email') {
        return NextResponse.json(
          { error: 'Invalid email address. Please contact support.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Unable to verify your current password. Please make sure you entered it correctly and try again.' },
        { status: 400 }
      );
    }

    // Update password
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return NextResponse.json(
          { error: 'User session not found' },
          { status: 400 }
        );
      }

      await updatePassword(currentUser, newPassword);

      // Note: Password changes are intentionally NOT logged in audit trail for security reasons
      // We only log that a password change occurred, without any sensitive data

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error: any) {
      console.error('Password update error:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        return NextResponse.json(
          { error: 'For security reasons, please log out and log back in before changing your password' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
