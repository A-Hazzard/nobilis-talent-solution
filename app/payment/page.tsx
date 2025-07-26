'use client'

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Check, CreditCard, Shield, Zap } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { PaymentService } from '@/lib/services/PaymentService';

// Initialize Stripe (you'll need to add your publishable key to .env.local)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const paymentOptions = PaymentService.getPaymentOptions();

export default function PaymentPage() {
  const [selectedOption, setSelectedOption] = useState('consultation');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { sessionId } = await PaymentService.createCheckoutSession(selectedOption);
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
      setIsLoading(false);
    }
  };

  const selectedPaymentOption = paymentOptions.find(option => option.id === selectedOption);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold text-hero mb-6">
              Invest in Your
              <span className="gradient-text"> Leadership</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the perfect leadership development option that fits your goals and schedule. 
              Secure payment powered by Stripe.
            </p>
          </div>

          {/* Payment Options */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {paymentOptions.map((option) => (
              <div
                key={option.id}
                className={`card-elevated p-8 rounded-2xl cursor-pointer transition-all duration-300 ${
                  selectedOption === option.id
                    ? 'ring-2 ring-primary shadow-teal'
                    : 'hover:shadow-medium hover:-translate-y-1'
                }`}
                onClick={() => setSelectedOption(option.id)}
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {option.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {option.description}
                  </p>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {PaymentService.formatPrice(option.price)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {option.duration}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="text-center">
                  <button
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                      selectedOption === option.id
                        ? 'btn-primary'
                        : 'btn-outline'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOption(option.id);
                    }}
                  >
                    {selectedOption === option.id ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Section */}
          {selectedPaymentOption && (
            <div className="max-w-2xl mx-auto">
              <div className="card-elevated p-8 rounded-2xl">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    Complete Your Purchase
                  </h2>
                  <div className="text-2xl font-bold text-primary mb-2">
                    {PaymentService.formatPrice(selectedPaymentOption.price)}
                  </div>
                  <p className="text-muted-foreground">
                    {selectedPaymentOption.title} - {selectedPaymentOption.duration}
                  </p>
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
                    {error}
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Pay Securely with Stripe</span>
                    </>
                  )}
                </button>

                {/* Security Features */}
                <div className="mt-8 pt-6 border-t border-border">
                  <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>SSL Secured</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>Instant Processing</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
} 