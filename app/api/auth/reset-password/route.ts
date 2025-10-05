import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { getAuth } from 'firebase-admin/auth';

export async function POST(request: NextRequest) {
  try {
    const { token, password, email } = await request.json();
    
    // Debug: Log what we received
    console.log('Reset password API called with:', { 
      token: token ? `${token.substring(0, 10)}...` : 'undefined',
      passwordLength: password ? password.length : 0,
      email: email || 'undefined'
    });

    if (!token || !password || !email) {
      console.log('Missing required fields:', { hasToken: !!token, hasPassword: !!password, hasEmail: !!email });
      return NextResponse.json({ error: 'Missing token, password, or email' }, { status: 400 });
    }

    if (password.length < 8) {
      console.log('Password too short:', { length: password.length });
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    try {
      // Validate token format
      if (token.length !== 64) { // 32 bytes = 64 hex characters
        console.log('Invalid token format:', { length: token.length });
        return NextResponse.json({ 
          error: 'Invalid reset token format' 
        }, { status: 400 });
      }

      // Look up the token in Firestore
      const db = getAdminFirestore();
      const tokenDoc = await db.collection('passwordResetTokens').doc(token).get();
      
      if (!tokenDoc.exists) {
        console.log('Token not found in database');
        return NextResponse.json({ 
          error: 'Invalid or expired reset token' 
        }, { status: 400 });
      }
      
      const tokenData = tokenDoc.data();
      
      // Check if token is expired
      const now = new Date();
      const expiresAt = tokenData?.expiresAt?.toDate();
      
      if (!expiresAt || now > expiresAt) {
        console.log('Token expired:', { now: now.toISOString(), expiresAt: expiresAt?.toISOString() });
        // Clean up expired token
        await db.collection('passwordResetTokens').doc(token).delete();
        return NextResponse.json({ 
          error: 'Reset token has expired. Please request a new one.' 
        }, { status: 400 });
      }
      
      // Check if token has been used
      if (tokenData?.used) {
        console.log('Token already used');
        return NextResponse.json({ 
          error: 'Reset token has already been used. Please request a new one.' 
        }, { status: 400 });
      }
      
      // Verify token belongs to the email
      if (tokenData?.email !== email) {
        console.log('Token email mismatch:', { tokenEmail: tokenData?.email, providedEmail: email });
        return NextResponse.json({ 
          error: 'Invalid reset token for this email address' 
        }, { status: 400 });
      }
      
      // Update the user's password in Firebase Auth
      const auth = getAuth();
      const userRecord = await auth.getUserByEmail(email);
      await auth.updateUser(userRecord.uid, { password });
      
      // Mark token as used
      await db.collection('passwordResetTokens').doc(token).update({
        used: true,
        usedAt: new Date(),
      });
      
      console.log('Password reset successfully for:', email);
      
      return NextResponse.json({ 
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error: any) {
      console.error('Password reset validation error:', error);
      return NextResponse.json({ 
        error: 'Failed to validate reset token. Please try again or request a new reset email.' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ 
      error: 'Internal server error. Please try again.' 
    }, { status: 500 });
  }
}
