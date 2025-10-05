import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/EmailService';
import { getAuth } from '@/lib/helpers/auth';

export async function POST(request: NextRequest) {
  try {
    // Try to parse JSON, but handle empty body gracefully
    let email, userId;
    try {
      const body = await request.json();
      email = body.email;
      userId = body.userId;
    } catch {
      // If no JSON body, get user info from auth token
      const authResult = await getAuth(request);
      if (!authResult.user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      email = authResult.user.email;
      userId = authResult.user.uid;
    }

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
    
    // For demo purposes, we'll create a simple verification link
    // In production, use Firebase Auth or your own token system
    
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