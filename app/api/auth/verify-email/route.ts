import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { logAuditAction } from '@/lib/utils/auditUtils';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Look up the verification token
    const tokenRef = doc(db, 'emailVerificationTokens', token);
    const tokenSnapshot = await getDoc(tokenRef);

    if (!tokenSnapshot.exists()) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    const tokenData = tokenSnapshot.data();

    // Check if token is expired (24 hours)
    const tokenCreatedAt = tokenData.createdAt?.toDate?.() || new Date(tokenData.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - tokenCreatedAt.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      // Delete expired token
      await deleteDoc(tokenRef);
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 400 }
      );
    }

    // Update user as email verified
    const userRef = doc(db, 'users', tokenData.userId);
    await updateDoc(userRef, {
      emailVerified: true,
      emailVerifiedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Delete the used token
    await deleteDoc(tokenRef);

    // Log audit action
    await logAuditAction({
      action: 'update',
      entity: 'auth',
      entityId: tokenData.userId,
      timestamp: Date.now(),
      details: {
        title: 'Email verified',
        email: tokenData.email,
        action: 'email_verification'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}