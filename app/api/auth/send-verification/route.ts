import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/EmailService';
import { getBaseUrl } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json();

    if (!email || !userId) {
      return NextResponse.json(
        { error: 'Email and userId are required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Generate a secure verification token
    // 2. Store it in the database with an expiration
    // 3. Send the email with the verification link
    
    const emailService = EmailService.getInstance();
    const baseUrl = getBaseUrl();
    
    // For demo purposes, we'll create a simple verification link
    // In production, use Firebase Auth or your own token system
    const verificationLink = `${baseUrl}/verify-email?token=demo-token&email=${encodeURIComponent(email)}&userId=${encodeURIComponent(userId)}`;
    
    const result = await emailService.sendWelcomeEmail(email, 'User');

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send verification email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Verification email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}