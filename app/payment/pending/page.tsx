'use client'

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Heart, AlertCircle, Clock } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { PaymentLinkService } from '@/lib/services/PaymentLinkService';
import type { PendingPayment } from '@/shared/types/payment';

// Initialize Stripe (you'll need to add your publishable key to .env.local)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PendingPaymentPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [additionalAmount, setAdditionalAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    if (email) {
      fetchPendingPayment(email);
    } else {
      setError('No email provided');
      setIsLoading(false);
    }
  }, [email]);

  const fetchPendingPayment = async (userEmail: string) => {
    try {
      const response = await fetch(`/api/payment/create-pending?email=${encodeURIComponent(userEmail)}`);
      
      if (response.status === 404) {
        setError('No pending payment found for your account');
        setIsLoading(false);
        return;
      }
      
      if (response.status === 410) {
        setError('Your payment has expired. Please contact Kareem to create a new payment.');
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch pending payment');
      }

      const data = await response.json();
      setPendingPayment(data.pendingPayment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!pendingPayment) return;

    setIsProcessing(true);
    setError('');

    try {
      const totalAmount = pendingPayment.baseAmount + additionalAmount;
      
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          optionId: 'custom',
          customData: {
            clientName: pendingPayment.clientName,
            clientEmail: pendingPayment.clientEmail,
            amount: totalAmount,
            description: pendingPayment.description,
            pendingPaymentId: pendingPayment.id,
            invoiceNumber: pendingPayment.invoiceNumber,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          setError(error.message || 'Payment failed');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerousAmount = (amount: number) => {
    setAdditionalAmount(amount);
    setCustomAmount(''); // Clear custom amount when selecting preset
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value) || 0;
    setAdditionalAmount(numValue);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading your payment...</p>
          </div>
        </div>
        {/* Footer rendered globally in RootLayout */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-destructive/10 rounded-full mb-6">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-hero mb-6">
              Payment
              <span className="text-destructive"> Error</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {error}
            </p>
            <a href="/" className="btn-primary">
              Return to Home
            </a>
          </div>
        </div>
        {/* Footer rendered globally in RootLayout */}
      </div>
    );
  }

  if (!pendingPayment) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-full mb-6">
              <Clock className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-hero mb-6">
              No Pending
              <span className="gradient-text"> Payment</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              You don't have any pending payments at the moment.
            </p>
            <a href="/" className="btn-primary">
              Return to Home
            </a>
          </div>
        </div>
        {/* Footer rendered globally in RootLayout */}
      </div>
    );
  }

  const totalAmount = pendingPayment.baseAmount + additionalAmount;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-24 pb-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
              <CreditCard className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-hero mb-6">
              Complete Your
              <span className="gradient-text"> Payment</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Thank you for choosing Kareem Payne for your leadership development.
            </p>
          </div>

          {/* Payment Details */}
          <div className="card-elevated p-8 rounded-2xl mb-12">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Payment Information */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Payment Details</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Service:</span>
                    <span className="font-medium">{pendingPayment.description}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Base Amount:</span>
                    <span className="font-semibold text-lg">{PaymentLinkService.formatAmount(pendingPayment.baseAmount)}</span>
                  </div>

                  {additionalAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Additional Amount:</span>
                      <span className="font-semibold text-primary">{PaymentLinkService.formatAmount(additionalAmount)}</span>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Amount:</span>
                      <span className="text-2xl font-bold text-primary">{PaymentLinkService.formatAmount(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generous Giving */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Want to be Generous?</h2>
                <p className="text-muted-foreground">
                  If you'd like to add a little extra to support Kareem's work, you can choose an additional amount below.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleGenerousAmount(25)}
                    className={`p-3 rounded-lg border transition-all ${
                      additionalAmount === 25 && !customAmount
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Heart className="w-4 h-4" />
                      <span className="font-medium">$25</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleGenerousAmount(50)}
                    className={`p-3 rounded-lg border transition-all ${
                      additionalAmount === 50 && !customAmount
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Heart className="w-4 h-4" />
                      <span className="font-medium">$50</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleGenerousAmount(100)}
                    className={`p-3 rounded-lg border transition-all ${
                      additionalAmount === 100 && !customAmount
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Heart className="w-4 h-4" />
                      <span className="font-medium">$100</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleGenerousAmount(0)}
                    className={`p-3 rounded-lg border transition-all ${
                      additionalAmount === 0 && !customAmount
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="font-medium">No Extra</span>
                  </button>
                </div>

                {/* Custom Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Or enter a custom amount:</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-muted-foreground">$</span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => handleCustomAmount(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Your generosity helps Kareem continue providing exceptional leadership coaching to others.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <div className="text-center">
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full max-w-md btn-primary py-4 text-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Pay {PaymentLinkService.formatAmount(totalAmount)} Securely</span>
                </>
              )}
            </button>

            <p className="text-sm text-muted-foreground mt-4">
              Secure payment powered by Stripe
            </p>
          </div>
        </div>
      </section>

      {/* Footer rendered globally in RootLayout */}
    </div>
  );
} 