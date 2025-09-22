import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Check if Stripe secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Payment functionality will not work.');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    })
  : null;

const paymentOptions = {
  consultation: {
    name: 'Leadership Consultation',
    description: 'One-on-one leadership coaching session (60 minutes)',
    price: 15000, // $150.00 in cents
  },
  workshop: {
    name: 'Team Workshop',
    description: 'Group leadership development workshop (Half-day session)',
    price: 50000, // $500.00 in cents
  },
  retreat: {
    name: 'Leadership Retreat',
    description: 'Comprehensive leadership development program (2-day intensive)',
    price: 250000, // $2500.00 in cents
  },
};

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { optionId, customData } = body;

    // Handle custom payments (from pending payments)
    if (optionId === 'custom' && customData) {
      const { clientName, clientEmail, amount, baseAmount, description, pendingPaymentId, invoiceNumber } = customData;

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
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending?email=${encodeURIComponent(clientEmail)}`,
        metadata: {
          clientName,
          clientEmail,
          description,
          amount: amount.toString(),
          baseAmount: baseAmount.toString(),
          pendingPaymentId,
          invoiceNumber,
        },
      });

      return NextResponse.json({ sessionId: session.id });
    }

    // Handle predefined payment options
    if (!optionId || !paymentOptions[optionId as keyof typeof paymentOptions]) {
      return NextResponse.json(
        { error: 'Invalid payment option' },
        { status: 400 }
      );
    }

    const option = paymentOptions[optionId as keyof typeof paymentOptions];

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: option.name,
              description: option.description,
            },
            unit_amount: option.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment`,
      metadata: {
        optionId,
        optionName: option.name,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 