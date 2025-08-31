import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { EmailService } from '@/lib/services/EmailService';

// Check if Stripe secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Webhook functionality will not work.');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    if (!stripe || !webhookSecret) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Payment successful for session:', session.id);

        // Update corresponding pending payment if present
        const pendingPaymentId = session.metadata?.pendingPaymentId;
        const clientEmail = session.customer_details?.email || session.metadata?.clientEmail || '';
        const clientName = session.metadata?.clientName || '';
        const amount = session.amount_total ? session.amount_total / 100 : Number(session.metadata?.amount || 0);

        if (pendingPaymentId) {
          try {
            const ref = doc(db, 'pendingPayments', pendingPaymentId);
            await updateDoc(ref, {
              status: 'completed',
              stripeSessionId: session.id,
              updatedAt: serverTimestamp(),
              bonusAmount: amount - (session.metadata?.baseAmount ? Number(session.metadata.baseAmount) : 0),
              totalAmount: amount,
            });
          } catch (e) {
            console.error('Failed to update pending payment status:', e);
          }
        }

        // Send payment confirmation email (receipt)
        try {
          const invoiceNumber = session.metadata?.invoiceNumber || session.id;
          const emailService = EmailService.getInstance();
          
          console.log('🔍 Webhook: Starting email process for payment:', {
            invoiceNumber,
            clientEmail,
            clientName,
            amount,
            pendingPaymentId
          });
          
          // Fetch invoice data and generate PDF (same pattern as new invoices)
          let invoiceData = null;
          let pdfAttachment = undefined;
          
          if (pendingPaymentId) {
            try {
              const ref = doc(db, 'pendingPayments', pendingPaymentId);
              const docSnap = await getDoc(ref);
              if (docSnap.exists()) {
                const pendingPayment = docSnap.data();
                invoiceData = {
                  invoiceNumber,
                  clientName: pendingPayment.clientName,
                  clientEmail: pendingPayment.clientEmail,
                  items: [{
                    id: '1',
                    description: pendingPayment.description,
                    quantity: 1,
                    unitPrice: pendingPayment.baseAmount,
                    total: amount,
                    type: 'service' as const
                  }],
                  subtotal: pendingPayment.baseAmount,
                  taxAmount: 0,
                  total: amount,
                  dueDate: new Date()
                };
                console.log('✅ Webhook: Invoice data constructed:', invoiceData);
                
                // Generate PDF using the same pattern as new invoices
                try {
                  const { PDFService } = await import('@/lib/services/PDFService');
                  const pdfService = PDFService.getInstance();
                  console.log('📄 Webhook: Generating PDF for payment confirmation...');
                  const pdf = await pdfService.generateInvoicePDF(invoiceData, invoiceNumber);
                  
                  if (pdf.success && pdf.data) {
                    pdfAttachment = {
                      filename: `invoice-${invoiceNumber}.pdf`,
                      content: pdf.data,
                      contentType: 'application/pdf'
                    };
                    console.log('✅ Webhook: PDF generated successfully, size:', pdf.data.length, 'bytes');
                  } else {
                    console.log('❌ Webhook: PDF generation failed:', pdf.error);
                  }
                } catch (pdfError) {
                  console.error('❌ Webhook: PDF generation error:', pdfError);
                }
              } else {
                console.log('❌ Webhook: Pending payment document not found');
              }
            } catch (fetchError) {
              console.error('❌ Webhook: Failed to fetch invoice data:', fetchError);
            }
          } else {
            console.log('⚠️ Webhook: No pendingPaymentId found in session metadata');
          }
          
          if (clientEmail) {
            console.log('📧 Webhook: Sending payment confirmation email...');
            const emailResult = await emailService.sendPaymentConfirmationWithPDF({
              to: clientEmail,
              clientName: clientName || clientEmail,
              invoiceNumber,
              amount,
              paymentMethod: session.payment_method_types?.[0] || 'card',
              transactionId: session.payment_intent?.toString() || session.id,
              pdfAttachment
            });
            console.log('📧 Webhook: Email result:', emailResult);
          } else {
            console.log('❌ Webhook: No client email found');
          }
        } catch (e) {
          console.error('❌ Webhook: Failed to send payment confirmation email:', e);
        }

        break;
      }
        
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment intent succeeded:', paymentIntent.id);
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', failedPayment.id);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
} 