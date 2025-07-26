# Payment System Setup Guide

This guide will help you set up the Stripe payment integration for Kareem Payne's leadership coaching website.

## Prerequisites

1. A Stripe account (sign up at [stripe.com](https://stripe.com))
2. Node.js and pnpm installed
3. Access to your website's environment variables

## Step 1: Stripe Account Setup

1. **Create a Stripe Account**
   - Go to [stripe.com](https://stripe.com) and create an account
   - Complete the account verification process
   - Add your business information

2. **Get Your API Keys**
   - In your Stripe Dashboard, go to Developers → API keys
   - Copy your **Publishable key** and **Secret key**
   - Keep these secure and never commit them to version control

## Step 2: Environment Variables

Create or update your `.env.local` file in the project root:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Step 3: Webhook Setup (Production)

For production, you'll need to set up webhooks to handle payment events:

1. **In Stripe Dashboard:**
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - Set the endpoint URL to: `https://yourdomain.com/api/payment/webhook`
   - Select these events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Copy the webhook signing secret and add it to your environment variables

2. **Update Environment Variables:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

## Step 4: Test the Integration

1. **Start the development server:**
   ```bash
   pnpm dev
   ```

2. **Test the payment flow:**
   - Navigate to `/payment`
   - Select a payment option
   - Use Stripe's test card numbers:
     - **Success:** `4242 4242 4242 4242`
     - **Decline:** `4000 0000 0000 0002`
   - Complete the test payment

## Step 5: Customization

### Payment Options

Edit the payment options in `lib/services/PaymentService.ts`:

```typescript
static getPaymentOptions(): PaymentOption[] {
  return [
    {
      id: 'consultation',
      title: 'Leadership Consultation',
      description: 'One-on-one leadership coaching session',
      price: 150, // Price in USD
      duration: '60 minutes',
      features: [
        'Personalized leadership assessment',
        'Goal setting and action planning',
        'Follow-up resources and materials',
        '30-day email support'
      ]
    },
    // Add more options as needed
  ];
}
```

### Styling

The payment pages use the existing design system. Key classes:
- `btn-primary` - Primary action buttons
- `btn-secondary` - Secondary action buttons
- `card-elevated` - Elevated card containers
- `text-primary` - Primary brand color
- `gradient-text` - Gradient text effect

## Step 6: Production Deployment

1. **Update Environment Variables:**
   - Use production Stripe keys (not test keys)
   - Set up production webhook endpoint
   - Configure domain-specific settings

2. **Security Considerations:**
   - Never expose secret keys in client-side code
   - Use HTTPS in production
   - Implement proper error handling
   - Add rate limiting to API routes

3. **Monitoring:**
   - Set up Stripe Dashboard alerts
   - Monitor webhook delivery
   - Track payment success/failure rates

## Step 7: Additional Features

### Email Notifications

To send confirmation emails, implement email service integration in the webhook handler:

```typescript
// In app/api/payment/webhook/route.ts
case 'checkout.session.completed':
  const session = event.data.object as Stripe.Checkout.Session;
  
  // Send confirmation email
  await sendConfirmationEmail(
    session.customer_details?.email,
    session.metadata
  );
  break;
```

### Database Integration

Store payment records in your database:

```typescript
// Example: Store payment in database
await prisma.payment.create({
  data: {
    sessionId: session.id,
    amount: session.amount_total,
    currency: session.currency,
    status: 'completed',
    customerEmail: session.customer_details?.email,
    metadata: session.metadata
  }
});
```

### Calendar Integration

Automatically create calendar events for consultations:

```typescript
// Example: Create calendar event
await createCalendarEvent({
  title: `Leadership Consultation - ${session.metadata?.optionName}`,
  customerEmail: session.customer_details?.email,
  duration: '60 minutes'
});
```

## Troubleshooting

### Common Issues

1. **"Invalid API key" error:**
   - Check that your environment variables are correctly set
   - Ensure you're using the right keys (test vs production)

2. **Webhook not receiving events:**
   - Verify webhook endpoint URL is accessible
   - Check webhook secret is correct
   - Ensure HTTPS is used in production

3. **Payment page not loading:**
   - Check browser console for errors
   - Verify Stripe publishable key is set
   - Ensure all dependencies are installed

### Support

For technical issues:
- Check Stripe documentation: [stripe.com/docs](https://stripe.com/docs)
- Review Next.js API routes documentation
- Check browser console and server logs

## Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Always verify webhook signatures** before processing events
3. **Use HTTPS** in production
4. **Implement proper error handling** and logging
5. **Regularly update dependencies** for security patches
6. **Monitor for suspicious activity** in Stripe Dashboard

## Testing

### Test Cards

Use these Stripe test cards for testing:

- **Successful payment:** `4242 4242 4242 4242`
- **Payment declined:** `4000 0000 0000 0002`
- **Insufficient funds:** `4000 0000 0000 9995`
- **Expired card:** `4000 0000 0000 0069`

### Test Scenarios

1. **Successful payment flow**
2. **Payment decline handling**
3. **Webhook event processing**
4. **Error handling**
5. **Mobile responsiveness**

---

This payment system is now fully integrated with your website's design and ready for production use! 