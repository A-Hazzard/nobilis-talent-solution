import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/EmailService';
import { getBaseUrl } from '@/lib/utils';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate a secure reset token (similar to Firebase's approach)
    const resetToken = randomBytes(32).toString('hex');
    
    // Create the reset link with our custom token
    const resetLink = `${getBaseUrl()}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    // Send the reset link via our custom email service to maintain the custom template
    const emailService = EmailService.getInstance();
    const result = await emailService.sendPasswordResetEmail(email, resetLink);

    if (result.success) {
      // In a real implementation, you would store this token in the database
      // with an expiration time (e.g., 1 hour from now)
      // For now, we'll just return success
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
