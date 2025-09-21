import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/helpers/auth';
import { PDFService } from '@/lib/services/PDFService';
import { EmailService } from '@/lib/services/EmailService';

export async function GET(request: NextRequest) {
  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      url: request.url,
      
      // Environment variables check
      env: {
        FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        SMTP_HOST: !!process.env.SMTP_HOST,
        SMTP_USER: !!process.env.SMTP_USER,
        STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      },
      
      // Authentication test
      auth: {
        hasAuthToken: !!request.cookies.get('auth-token')?.value,
        hasRefreshToken: !!request.cookies.get('refresh-token')?.value,
        authHeader: !!request.headers.get('authorization'),
      },
      
      // Services test
      services: {
        pdfService: 'available',
        emailService: 'available',
      }
    };

    // Test authentication
    try {
      const authResult = await getAuth(request);
      debugInfo.auth.user = authResult.user;
      debugInfo.auth.error = authResult.error;
    } catch (error) {
      debugInfo.auth.error = error instanceof Error ? error.message : 'Unknown auth error';
    }

    // Test PDF service
    try {
      const pdfService = PDFService.getInstance();
      debugInfo.services.pdfService = 'initialized';
    } catch (error) {
      debugInfo.services.pdfService = `error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // Test email service
    try {
      const emailService = EmailService.getInstance();
      debugInfo.services.emailService = 'initialized';
    } catch (error) {
      debugInfo.services.emailService = `error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Debug endpoint failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { testType } = await request.json();
    
    if (testType === 'pdf') {
      // Test PDF generation
      const pdfService = PDFService.getInstance();
      const testInvoice = {
        invoiceNumber: 'TEST-001',
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        items: [
          {
            id: '1',
            description: 'Test Service',
            quantity: 1,
            unitPrice: 100,
            total: 100,
            type: 'service' as const
          }
        ],
        subtotal: 100,
        taxAmount: 0,
        total: 100,
        dueDate: new Date()
      };

      const result = await pdfService.generateInvoicePDF(testInvoice, 'TEST-001');
      
      return NextResponse.json({
        success: result.success,
        error: result.error,
        dataSize: result.data?.length || 0,
        timestamp: new Date().toISOString()
      });
    }

    if (testType === 'email') {
      // Test email service
      const emailService = EmailService.getInstance();
      const result = await emailService.sendTestEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>This is a test email</p>'
      });
      
      return NextResponse.json({
        success: result.success,
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({ error: 'Invalid test type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
