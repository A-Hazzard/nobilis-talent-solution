import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/EmailService';
import { getBaseUrl } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, message } = body;

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, message' },
        { status: 400 }
      );
    }

    const emailService = EmailService.getInstance();
    const baseUrl = getBaseUrl();

    const testContent = `
      <h2>Email Test</h2>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
      <hr>
      <p><small>This is a test email sent from ${baseUrl}</small></p>
    `;

    const result = await emailService.sendEmail({
      to,
      subject: `[TEST] ${subject}`,
      html: testContent,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send test email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const emailService = EmailService.getInstance();
    const result = await emailService.testConnection();

    if (result.success) {
      return NextResponse.json(
        { message: 'Email configuration is valid' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Email configuration test failed', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Email configuration test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 