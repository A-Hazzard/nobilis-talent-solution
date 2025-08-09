import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
            });
          } catch (e) {
            console.error('Failed to update pending payment status:', e);
          }
        }

        // Send payment confirmation email (receipt)
        try {
          const invoiceNumber = session.metadata?.invoiceNumber || session.id;
          const emailService = EmailService.getInstance();
          if (clientEmail) {
            await emailService.sendPaymentConfirmation({
              to: clientEmail,
              clientName: clientName || clientEmail,
              invoiceNumber,
              amount,
              paymentMethod: session.payment_method_types?.[0] || 'card',
              transactionId: session.payment_intent?.toString() || session.id,
            });
          }
        } catch (e) {
          console.error('Failed to send payment confirmation email:', e);
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