import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/EmailService';
import { getBaseUrl } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Generate a secure reset token
    // 2. Store it in the database with an expiration
    // 3. Send the email with the reset link
    
    const emailService = EmailService.getInstance();
    const baseUrl = getBaseUrl();
    
    // For demo purposes, we'll create a simple reset link
    // In production, use Firebase Auth or your own token system
    const resetLink = `${baseUrl}/reset-password?token=demo-token&email=${encodeURIComponent(email)}`;
    
    const result = await emailService.sendPasswordResetEmail(email, resetLink);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send password reset email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
