import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminFirestore } from '@/lib/firebase/admin';
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
  const startTime = Date.now();
  const requestId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`🚀 [${requestId}] Webhook received at ${new Date().toISOString()}`);
  console.log(`🔍 [${requestId}] Environment check:`, {
    hasStripe: !!stripe,
    hasWebhookSecret: !!webhookSecret,
    webhookSecretLength: webhookSecret?.length || 0,
    webhookSecretPreview: webhookSecret ? `${webhookSecret.substring(0, 10)}...` : 'undefined'
  });

  try {
    if (!stripe || !webhookSecret) {
      const error = 'Stripe is not configured. Please set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET environment variables.';
      console.error(`❌ [${requestId}] ${error}`);
      return NextResponse.json(
        { error, requestId },
        { status: 500 }
      );
    }

    // Check if webhook secret is still the placeholder
    if (webhookSecret === 'whsec_your_webhook_secret_here') {
      const error = 'Webhook secret is still set to placeholder value. Please update STRIPE_WEBHOOK_SECRET with the actual secret from Stripe dashboard.';
      console.error(`❌ [${requestId}] ${error}`);
      return NextResponse.json(
        { error, requestId },
        { status: 500 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;
    
    console.log(`📝 [${requestId}] Request details:`, {
      bodyLength: body.length,
      hasSignature: !!signature,
      signatureLength: signature?.length || 0,
      headers: Object.fromEntries(request.headers.entries())
    });

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log(`✅ [${requestId}] Webhook signature verified successfully`);
    } catch (err) {
      const error = `Invalid signature: ${err instanceof Error ? err.message : 'Unknown error'}`;
      console.error(`❌ [${requestId}] ${error}`);
      return NextResponse.json(
        { error, requestId },
        { status: 400 }
      );
    }

    console.log(`📨 [${requestId}] Processing event: ${event.type} (ID: ${event.id})`);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`💰 [${requestId}] Payment successful for session:`, {
          sessionId: session.id,
          amountTotal: session.amount_total,
          currency: session.currency,
          customerEmail: session.customer_details?.email,
          metadata: session.metadata
        });

        // Update corresponding pending payment if present
        const pendingPaymentId = session.metadata?.pendingPaymentId;
        const clientEmail = session.customer_details?.email || session.metadata?.clientEmail || '';
        const clientName = session.metadata?.clientName || '';
        const amount = session.amount_total ? session.amount_total / 100 : Number(session.metadata?.amount || 0);
        const baseAmount = session.metadata?.baseAmount ? Number(session.metadata.baseAmount) : 0;
        const bonusAmount = Math.max(0, amount - baseAmount);

        console.log(`🧮 [${requestId}] Amount calculations:`, {
          amount,
          baseAmount,
          bonusAmount,
          pendingPaymentId
        });

        if (pendingPaymentId) {
          try {
            console.log(`📝 [${requestId}] Updating pending payment document:`, pendingPaymentId);
            const db = getAdminFirestore();
            const ref = db.collection('pendingPayments').doc(pendingPaymentId);
            
            // Get current document to preserve existing data
            const currentDoc = await ref.get();
            if (currentDoc.exists) {
              const currentData = currentDoc.data();
              console.log(`📄 [${requestId}] Current pending payment data:`, currentData);
            }

            const updateData = {
              status: 'completed',
              stripeSessionId: session.id,
              updatedAt: new Date(),
              bonusAmount: bonusAmount,
              totalAmount: amount,
              // Preserve existing fields
              ...(currentDoc.exists && {
                baseAmount: currentDoc.data()?.baseAmount || baseAmount,
                description: currentDoc.data()?.description,
                clientName: currentDoc.data()?.clientName,
                clientEmail: currentDoc.data()?.clientEmail,
                notes: currentDoc.data()?.notes
              })
            };

            console.log(`📝 [${requestId}] Update data:`, updateData);
            await ref.update(updateData);
            console.log(`✅ [${requestId}] Pending payment updated successfully`);
          } catch (e) {
            console.error(`❌ [${requestId}] Failed to update pending payment status:`, e);
          }
        } else {
          console.log(`⚠️ [${requestId}] No pendingPaymentId found in session metadata`);
        }

        // Send payment confirmation email (receipt)
        try {
          const invoiceNumber = session.metadata?.invoiceNumber || session.id;
          const emailService = EmailService.getInstance();
          
          console.log(`📧 [${requestId}] Starting email process for payment:`, {
            invoiceNumber,
            clientEmail,
            clientName,
            amount,
            pendingPaymentId
          });
          
          // Generate PDF invoice with proper amounts (including bonus if applicable)
          let pdfAttachment = undefined;
          
          if (pendingPaymentId) {
            try {
              console.log(`📄 [${requestId}] Fetching invoice data for PDF generation...`);
              const db = getAdminFirestore();
              const ref = db.collection('pendingPayments').doc(pendingPaymentId);
              const docSnap = await ref.get();
              if (docSnap.exists) {
                const pendingPayment = docSnap.data();
                const docBaseAmount = Number(pendingPayment?.baseAmount || 0);
                const docTotalAmount = amount;
                const docBonusAmount = Math.max(0, docTotalAmount - docBaseAmount);
                
                console.log(`💰 [${requestId}] Payment amounts from document:`, {
                  docBaseAmount,
                  docTotalAmount,
                  docBonusAmount
                });
                
                // Create items array with base service and bonus if applicable
                const items = [{
                  id: '1',
                  description: pendingPayment?.description || 'Leadership Consultation',
                  quantity: 1,
                  unitPrice: docBaseAmount,
                  total: docBaseAmount,
                  type: 'service' as const
                }];
                
                // Add bonus item if there's a bonus amount
                if (docBonusAmount > 0) {
                  items.push({
                    id: '2',
                    description: 'Additional Payment (Bonus)',
                    quantity: 1,
                    unitPrice: docBonusAmount,
                    total: docBonusAmount,
                    type: 'service' as const
                  });
                }
                
                const invoiceData = {
                  invoiceNumber,
                  clientName: pendingPayment?.clientName,
                  clientEmail: pendingPayment?.clientEmail,
                  items,
                  subtotal: docTotalAmount,
                  taxAmount: 0,
                  total: docTotalAmount,
                  dueDate: new Date(),
                  bonusAmount: docBonusAmount,
                  notes: docBonusAmount > 0 ? `Includes $${docBonusAmount.toFixed(2)} bonus payment` : undefined
                };
                
                console.log(`📄 [${requestId}] Invoice data for PDF:`, invoiceData);
                console.log(`📄 [${requestId}] Generating PDF for payment confirmation...`);
                
                const { PDFService } = await import('@/lib/services/PDFService');
                const pdfService = PDFService.getInstance();
                const pdf = await pdfService.generateInvoicePDF(invoiceData, invoiceNumber);
                
                if (pdf.success && pdf.data) {
                  pdfAttachment = {
                    filename: `invoice-${invoiceNumber}.pdf`,
                    content: pdf.data,
                    contentType: 'application/pdf'
                  };
                  console.log(`✅ [${requestId}] PDF generated successfully, size:`, pdf.data.length, 'bytes');
                } else {
                  console.log(`❌ [${requestId}] PDF generation failed:`, pdf.error);
                }
              } else {
                console.log(`❌ [${requestId}] Pending payment document not found`);
              }
            } catch (fetchError) {
              console.error(`❌ [${requestId}] Failed to fetch invoice data:`, fetchError);
            }
          } else {
            console.log(`⚠️ [${requestId}] No pendingPaymentId found in session metadata`);
          }
          
          if (clientEmail) {
            console.log(`📧 [${requestId}] Sending payment confirmation email...`);
            const emailResult = await emailService.sendPaymentConfirmationWithPDF({
              to: clientEmail,
              clientName: clientName || clientEmail,
              invoiceNumber,
              amount: amount,
              paymentMethod: session.payment_method_types?.[0] || 'card',
              transactionId: session.payment_intent?.toString() || session.id,
              pdfAttachment
            });
            console.log(`📧 [${requestId}] Email result:`, emailResult);
            
            if (!emailResult.success) {
              console.error(`❌ [${requestId}] Email sending failed:`, emailResult.error);
            }
          } else {
            console.log(`❌ [${requestId}] No client email found`);
          }
        } catch (e) {
          console.error(`❌ [${requestId}] Failed to send payment confirmation email:`, e);
        }

        break;
      }
        
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`✅ [${requestId}] Payment intent succeeded:`, paymentIntent.id);
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log(`❌ [${requestId}] Payment failed:`, failedPayment.id);
        break;
        
      default:
        console.log(`ℹ️ [${requestId}] Unhandled event type: ${event.type}`);
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [${requestId}] Webhook processed successfully in ${duration}ms`);
    return NextResponse.json({ received: true, requestId, duration });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${requestId}] Webhook error after ${duration}ms:`, error);
    return NextResponse.json(
      { error: 'Webhook handler failed', requestId, duration },
      { status: 500 }
    );
  }
} 