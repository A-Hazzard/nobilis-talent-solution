import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/EmailService';

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    const emailService = EmailService.getInstance();

    // Test email configuration first
    const connectionTest = await emailService.testConnection();
    if (!connectionTest.success) {
      return NextResponse.json(
        { error: 'Email configuration test failed', details: connectionTest.error },
        { status: 500 }
      );
    }

    let result;

    switch (type) {
      case 'welcome':
        result = await emailService.sendWelcomeEmail(email, 'Test User');
        break;
      case 'password-reset':
        result = await emailService.sendPasswordResetEmail(
          email, 
          `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=test-token`
        );
        break;
      case 'invoice':
        // Create a test invoice
        const testInvoice = {
          invoiceNumber: 'TEST-001',
          clientName: 'Test Client',
          clientEmail: 'test@example.com',
          items: [
            { 
              id: '1', 
              description: 'Consultation Session', 
              quantity: 1, 
              unitPrice: 150, 
              total: 150, 
              type: 'consultation' as const 
            },
            { 
              id: '2', 
              description: 'Strategy Planning', 
              quantity: 1, 
              unitPrice: 300, 
              total: 300, 
              type: 'service' as const 
            },
          ],
          subtotal: 450,
          taxAmount: 0,
          total: 450,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        };
        result = await emailService.sendInvoiceEmail({
          invoice: testInvoice,
          clientEmail: email,
          clientName: testInvoice.clientName,
          customMessage: 'This is a test invoice email.'
        });
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid email type. Use: welcome, password-reset, or invoice' },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json(
        { message: `${type} email sent successfully to ${email}` },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
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