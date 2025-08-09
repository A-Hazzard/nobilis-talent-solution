import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { EmailService } from '@/lib/services/EmailService';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });

    const clientEmail = (session.customer_details?.email || (session.metadata?.clientEmail as string) || '').trim();
    const clientName = (session.metadata?.clientName as string) || '';
    const amountTotal = session.amount_total ? session.amount_total / 100 : Number(session.metadata?.amount || 0);
    const pendingPaymentId = session.metadata?.pendingPaymentId as string | undefined;
    const invoiceNumber = (session.metadata?.invoiceNumber as string) || undefined;
    const transactionId = (typeof session.payment_intent === 'object' && session.payment_intent?.id)
      ? session.payment_intent.id
      : (session.payment_intent as string) || sessionId;

    // Best-effort Firestore update
    if (pendingPaymentId) {
      try {
        const ref = doc(db, 'pendingPayments', pendingPaymentId);
        const snap = await getDoc(ref);
        const currentStatus = snap.exists() ? (snap.data().status as string) : undefined;
        if (currentStatus !== 'completed') {
          await updateDoc(ref, {
            status: 'completed',
            stripeSessionId: session.id,
            updatedAt: serverTimestamp(),
          });
        }
      } catch (e) {
        console.error('Confirm route Firestore update failed:', e);
      }
    }

    // Best-effort email send
    try {
      if (clientEmail) {
        const emailService = EmailService.getInstance();
        await emailService.sendPaymentConfirmation({
          to: clientEmail,
          clientName: clientName || clientEmail,
          invoiceNumber: invoiceNumber || sessionId,
          amount: amountTotal,
          paymentMethod: session.payment_method_types?.[0] || 'card',
          transactionId,
        });
      }
    } catch (e) {
      console.error('Confirm route email send failed:', e);
    }

    return NextResponse.json({
      amount: `$${amountTotal.toFixed(2)}`,
      service: clientName ? `Leadership Consultation for ${clientName}` : 'Leadership Consultation',
      email: clientEmail || '—',
      date: new Date().toLocaleDateString(),
      transactionId,
    });
  } catch (error) {
    console.error('Payment confirm error:', error);
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 });
  }
}


