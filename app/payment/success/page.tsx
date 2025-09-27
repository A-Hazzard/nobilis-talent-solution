'use client'

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import type { PaymentConfirmation } from '@/shared/types/payment';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [paymentDetails, setPaymentDetails] = useState<PaymentConfirmation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'unknown'>('unknown');
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const hasCalledRef = useRef(false);

  // Function to check payment status
  const checkPaymentStatus = async (email: string): Promise<'pending' | 'paid' | 'unknown'> => {
    try {
      console.log('🔍 Payment Success: Checking payment status for email:', email);
      const response = await fetch(`/api/payment/user-status?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      
      console.log('🔍 Payment Success: Payment status response:', data);
      
      if (data.shouldShowPaymentButton) {
        return 'pending';
      } else if (data.hasCompletedPayment) {
        return 'paid';
      } else {
        return 'unknown';
      }
    } catch (error) {
      console.error('❌ Payment Success: Error checking payment status:', error);
      return 'unknown';
    }
  };

  // Polling function to check payment status up to 3 times
  const pollPaymentStatus = async (email: string) => {
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      setPollingAttempts(attempts);
      
      console.log(`🔍 Payment Success: Polling attempt ${attempts}/${maxAttempts} for email:`, email);
      
      const status = await checkPaymentStatus(email);
      setPaymentStatus(status);
      
      console.log(`🔍 Payment Success: Status after attempt ${attempts}:`, status);
      
      if (status === 'paid') {
        console.log('✅ Payment Success: Payment confirmed as paid, stopping polling');
        break;
      } else if (status === 'pending' && attempts < maxAttempts) {
        console.log(`⏳ Payment Success: Payment still pending, waiting before next attempt...`);
        // Wait 2 seconds before next attempt
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.log(`❌ Payment Success: Max attempts reached or unknown status, stopping polling`);
        break;
      }
    }
  };

  useEffect(() => {
    if (!sessionId) return;

    // Prevent duplicate POSTs in development (React Strict Mode double-invokes effects)
    if (hasCalledRef.current) {
      console.log('🔁 Payment Success: Skipping duplicate confirm call for session:', sessionId);
      return;
    }
    hasCalledRef.current = true;

    {
      // Check if we've already processed this session to prevent duplicate emails
      const processedKey = `payment_processed_${sessionId}`;
      const alreadyProcessed = sessionStorage.getItem(processedKey);
      
      if (alreadyProcessed) {
        // If already processed, just fetch the data without triggering emails
        (async () => {
          try {
            const res = await fetch('/api/payment/confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId, skipEmail: true }),
            });
            const data = await res.json();
            setPaymentDetails({
              sessionId: sessionId,
              amount: data.amount,
              service: data.service,
              email: data.email,
              date: data.date,
              transactionId: data.transactionId,
              invoiceNumber: data.invoiceNumber,
              baseAmount: data.baseAmount,
              bonusAmount: data.bonusAmount,
              totalAmount: data.totalAmount,
            });
            
            // Start polling payment status if we have an email
            if (data.email) {
              // Store email in sessionStorage for navigation component
              sessionStorage.setItem('payment_success_email', data.email);
              pollPaymentStatus(data.email);
            }
          } catch {
            // Fallback to minimal display
            setPaymentDetails({
              sessionId: sessionId || '',
              amount: '$0.00',
              service: 'Leadership Consultation',
              email: '',
              date: new Date().toLocaleDateString(),
              transactionId: '',
              invoiceNumber: '',
              baseAmount: '$0.00',
              bonusAmount: '$0.00',
              totalAmount: '$0.00',
            });
          } finally {
            setIsLoading(false);
          }
        })();
      } else {
        // First time processing - confirm with backend to get canonical details + trigger email/DB safety updates
        (async () => {
          try {
            console.log('🔄 Payment Success: Calling payment confirm API for session:', sessionId);
            const res = await fetch('/api/payment/confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId }),
            });
            console.log('📡 Payment Success: API response status:', res.status);
            const data = await res.json();
            console.log('📡 Payment Success: API response data:', data);
            setPaymentDetails({
              sessionId: sessionId,
              amount: data.amount,
              service: data.service,
              email: data.email,
              date: data.date,
              transactionId: data.transactionId,
              invoiceNumber: data.invoiceNumber,
              baseAmount: data.baseAmount,
              bonusAmount: data.bonusAmount,
              totalAmount: data.totalAmount,
            });
            
            // Start polling payment status if we have an email
            if (data.email) {
              // Store email in sessionStorage for navigation component
              sessionStorage.setItem('payment_success_email', data.email);
              pollPaymentStatus(data.email);
            }
            
            // Mark this session as processed to prevent duplicate emails on reload
            sessionStorage.setItem(processedKey, 'true');
          } catch {
            // Fallback to minimal display
            setPaymentDetails({
              sessionId: sessionId || '',
              amount: '$0.00',
              service: 'Leadership Consultation',
              email: '',
              date: new Date().toLocaleDateString(),
              transactionId: '',
              invoiceNumber: '',
              baseAmount: '$0.00',
              bonusAmount: '$0.00',
              totalAmount: '$0.00',
            });
          } finally {
            setIsLoading(false);
          }
        })();
      }
    }
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Verifying your payment...</p>
            {pollingAttempts > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Checking payment status... (Attempt {pollingAttempts}/3)
              </p>
            )}
          </div>
        </div>
        {/* Footer rendered globally in RootLayout */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-24 pb-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full mb-4 sm:mb-6">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-hero mb-4 sm:mb-6">
              Payment
              <span className="gradient-text"> Successful!</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Thank you for choosing Nobilis Talent Solutions. We're excited to work with you!
            </p>
          </div>

          {/* Payment Details */}
          <div className="card-elevated p-4 sm:p-6 lg:p-8 rounded-2xl mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6 text-center">
              Payment Confirmation
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                    <span className="text-foreground font-medium text-sm sm:text-base">Amount Paid:</span>
                  </div>
                  <span className="text-primary font-bold text-lg sm:text-xl break-words">
                    {paymentDetails?.totalAmount || paymentDetails?.amount || 'USD 0.00'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                    <span className="text-foreground font-medium text-sm sm:text-base">Service:</span>
                  </div>
                  <span className="text-foreground text-sm sm:text-base break-words">{paymentDetails?.service}</span>
                </div>
                {paymentDetails?.baseAmount && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                      <span className="text-foreground font-medium text-sm sm:text-base">Base Amount:</span>
                    </div>
                    <span className="text-foreground text-sm sm:text-base break-words">{paymentDetails.baseAmount}</span>
                  </div>
                )}
                {paymentDetails?.bonusAmount && Number(paymentDetails.bonusAmount.replace(/[^\d.]/g, '')) > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="text-foreground font-medium text-sm sm:text-base">Bonus Amount:</span>
                    </div>
                    <span className="text-green-600 font-semibold text-sm sm:text-base break-words">{paymentDetails.bonusAmount}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                    <span className="text-foreground font-medium text-sm sm:text-base">Invoice Number:</span>
                  </div>
                  <span className="text-foreground font-mono text-sm sm:text-base break-all">{paymentDetails?.invoiceNumber || '—'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                    <span className="text-foreground font-medium text-sm sm:text-base">Email:</span>
                  </div>
                  <span className="text-foreground text-sm sm:text-base break-all">{paymentDetails?.email}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                    <span className="text-foreground font-medium text-sm sm:text-base">Date:</span>
                  </div>
                  <span className="text-foreground text-sm sm:text-base break-words">{paymentDetails?.date}</span>
                </div>
                {paymentDetails?.transactionId && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                      <span className="text-foreground font-medium text-sm sm:text-base">Transaction ID:</span>
                    </div>
                    <span className="text-foreground font-mono text-xs sm:text-sm break-all">{paymentDetails.transactionId}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Bonus Amount Notice */}
            {paymentDetails?.bonusAmount && Number(paymentDetails.bonusAmount.replace(/[^\d.]/g, '')) > 0 && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <span className="text-green-800 font-medium text-sm sm:text-base block">
                      Thank you for your generous bonus payment! 
                    </span>
                    <p className="text-green-700 text-xs sm:text-sm mt-1 break-words">
                      Your additional contribution helps us continue providing exceptional talent management solutions.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Status Notice */}
          {paymentStatus === 'pending' && pollingAttempts >= 3 && (
            <div className="card-elevated p-4 sm:p-6 rounded-2xl mb-8 bg-yellow-50 border border-yellow-200">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-yellow-500 rounded-full flex-shrink-0 mt-0.5"></div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-yellow-800 font-semibold text-base sm:text-lg mb-2">
                    Payment Processing
                  </h3>
                  <p className="text-yellow-700 text-sm sm:text-base">
                    Your payment is still being processed. This can take a few minutes. 
                    You will receive a confirmation email once the payment is complete.
                  </p>
                  <p className="text-yellow-600 text-xs sm:text-sm mt-2">
                    If you don't receive confirmation within 15 minutes, please contact us at{' '}
                    <a href="mailto:support@nobilistalent.com" className="underline hover:no-underline">
                      support@nobilistalent.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {paymentStatus === 'paid' && (
            <div className="card-elevated p-4 sm:p-6 rounded-2xl mb-8 bg-green-50 border border-green-200">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex-shrink-0 mt-0.5"></div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-green-800 font-semibold text-base sm:text-lg mb-2">
                    Payment Confirmed
                  </h3>
                  <p className="text-green-700 text-sm sm:text-base">
                    Your payment has been successfully processed and confirmed in our system.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <a
              href="/"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <span>Return to Home</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            
            <div className="text-sm text-muted-foreground">
              Questions? Contact us at{' '}
              <a href="mailto:support@nobilistalent.com" className="text-primary hover:underline">
                support@nobilistalent.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer rendered globally in RootLayout */}
    </div>
  );
} 