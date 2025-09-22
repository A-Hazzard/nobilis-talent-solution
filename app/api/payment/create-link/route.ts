import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CreatePaymentLinkRequest, PaymentLinkResponse } from '@/shared/types/payment';

// Check if Stripe secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Payment functionality will not work.');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' },
        { status: 500 }
      );
    }

    const body: CreatePaymentLinkRequest = await request.json();
    const { clientName, clientEmail, amount, description } = body;

    // Validate input
    if (!clientName || !clientEmail || !amount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: clientName, clientEmail, amount, description' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session instead of Payment Link
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Leadership Consultation - ${clientName}`,
              description: description,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?client=${encodeURIComponent(clientName)}&amount=${amount}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/leads`,
      metadata: {
        clientName,
        clientEmail,
        description,
        amount: amount.toString(),
      },
    });

    // Generate a unique ID for tracking
    const paymentLinkId = `pl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const response: PaymentLinkResponse = {
      id: paymentLinkId,
      paymentUrl: session.url!,
      stripePaymentLinkId: session.id,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating payment link:', error);
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 }
    );
  }
} 