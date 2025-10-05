import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { EmailService } from '@/lib/services/EmailService';

/**
 * Test endpoint for webhook debugging
 * This allows testing webhook logic without requiring actual Stripe webhook calls
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      pendingPaymentId, 
      testMode = 'webhook-logic',
      simulatePayment = true 
    } = body;

    console.log('🧪 Webhook Test: Starting test with params:', {
      pendingPaymentId,
      testMode,
      simulatePayment
    });

    if (!pendingPaymentId) {
      return NextResponse.json(
        { error: 'pendingPaymentId is required' },
        { status: 400 }
      );
    }

    // Test 1: Check if pending payment exists
    console.log('🧪 Webhook Test: Checking if pending payment exists...');
    const ref = doc(db, 'pendingPayments', pendingPaymentId);
    const docSnap = await getDoc(ref);
    
    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'Pending payment not found', pendingPaymentId },
        { status: 404 }
      );
    }

    const pendingPayment = docSnap.data();
    console.log('🧪 Webhook Test: Found pending payment:', pendingPayment);

    // Test 2: Simulate payment completion
    if (simulatePayment) {
      console.log('🧪 Webhook Test: Simulating payment completion...');
      
      // Simulate Stripe session data
      const simulatedSession = {
        id: `test_session_${Date.now()}`,
        amount_total: (pendingPayment.baseAmount + (pendingPayment.bonusAmount || 0)) * 100, // Convert to cents
        metadata: {
          pendingPaymentId,
          baseAmount: pendingPayment.baseAmount.toString(),
          clientName: pendingPayment.clientName,
          clientEmail: pendingPayment.clientEmail
        },
        customer_details: {
          email: pendingPayment.clientEmail
        },
        payment_method_types: ['card'],
        payment_intent: `test_pi_${Date.now()}`
      };

      console.log('🧪 Webhook Test: Simulated session data:', simulatedSession);

      // Test 3: PDF generation (deprecated - frontend only)
      console.log('🧪 Webhook Test: PDF generation test skipped (frontend-only)');
      try {
        // PDF generation is now frontend-only
        
        const baseAmount = Number(pendingPayment.baseAmount || 0);
        const bonusAmount = Number(pendingPayment.bonusAmount || 0);
        const totalAmount = baseAmount + bonusAmount;
        
        const invoiceData = {
          invoiceNumber: `TEST_${Date.now()}`,
          clientName: pendingPayment.clientName,
          clientEmail: pendingPayment.clientEmail,
          items: [
            {
              id: '1',
              description: pendingPayment.description || 'Leadership Consultation',
              quantity: 1,
              unitPrice: baseAmount,
              total: baseAmount,
              type: 'service' as const
            },
            ...(bonusAmount > 0 ? [{
              id: '2',
              description: 'Additional Payment (Bonus)',
              quantity: 1,
              unitPrice: bonusAmount,
              total: bonusAmount,
              type: 'service' as const
            }] : [])
          ],
          subtotal: totalAmount,
          taxAmount: 0,
          total: totalAmount,
          dueDate: new Date(),
          bonusAmount: bonusAmount > 0 ? bonusAmount : undefined,
          notes: bonusAmount > 0 ? `Includes $${bonusAmount.toFixed(2)} bonus payment` : undefined
        };

        console.log('🧪 Webhook Test: PDF generation skipped (frontend-only)');
        
        // Test 4: Test email sending
        console.log('🧪 Webhook Test: Testing email sending (without PDF)...');
        const emailService = EmailService.getInstance();

        const emailResult = await emailService.sendPaymentConfirmationWithPDF({
          to: pendingPayment.clientEmail,
          clientName: pendingPayment.clientName,
          invoiceNumber: invoiceData.invoiceNumber,
          amount: totalAmount,
          paymentMethod: 'card',
          transactionId: simulatedSession.id,
          // No PDF attachment - frontend only
        });

        console.log('🧪 Webhook Test: Email result:', emailResult);

        return NextResponse.json({
          success: true,
          message: 'Webhook test completed successfully (PDF generation skipped)',
          testResults: {
            pendingPaymentFound: true,
            pdfGenerated: false, // Deprecated - frontend only
            pdfSize: 0,
            emailSent: emailResult.success,
              emailError: emailResult.error,
              simulatedSession: simulatedSession,
              invoiceData: invoiceData
            }
          });

      } catch (error) {
        console.error('❌ Webhook Test: Error during PDF generation or email:', error);
        return NextResponse.json({
          success: false,
          error: 'Error during PDF generation or email',
          details: error instanceof Error ? error.message : 'Unknown error',
          testResults: {
            pendingPaymentFound: true,
            pdfGenerated: false,
            emailSent: false
          }
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Pending payment found',
      pendingPayment: pendingPayment
    });

  } catch (error) {
    console.error('❌ Webhook Test: Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Webhook test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check webhook configuration
 */
export async function GET() {
  const config = {
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    webhookSecretLength: process.env.STRIPE_WEBHOOK_SECRET?.length || 0,
    webhookSecretPreview: process.env.STRIPE_WEBHOOK_SECRET 
      ? `${process.env.STRIPE_WEBHOOK_SECRET.substring(0, 10)}...` 
      : 'undefined',
    isPlaceholderSecret: process.env.STRIPE_WEBHOOK_SECRET === 'whsec_your_webhook_secret_here',
    hasSMTP: !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS,
    environment: process.env.NODE_ENV || 'development'
  };

  return NextResponse.json({
    success: true,
    message: 'Webhook configuration check',
    config,
    instructions: {
      webhookSecret: config.isPlaceholderSecret 
        ? '⚠️ Webhook secret is still placeholder. Update STRIPE_WEBHOOK_SECRET in .env file.'
        : '✅ Webhook secret appears to be configured.',
      stripe: config.hasStripeKey 
        ? '✅ Stripe secret key is configured.'
        : '❌ Stripe secret key is missing.',
      smtp: config.hasSMTP 
        ? '✅ SMTP configuration appears complete.'
        : '❌ SMTP configuration is incomplete.'
    }
  });
}

