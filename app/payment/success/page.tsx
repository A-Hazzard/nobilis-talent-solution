'use client'

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Navigation from '@/components/Navigation';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Confirm with backend to get canonical details + trigger email/DB safety updates
      (async () => {
        try {
          const res = await fetch('/api/payment/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          const data = await res.json();
          setPaymentDetails({
            amount: data.amount,
            service: data.service,
            email: data.email,
            date: data.date,
          });
        } catch {
          // Fallback to minimal display
          setPaymentDetails({
            amount: '$0.00',
            service: 'Leadership Consultation',
            email: '',
            date: new Date().toLocaleDateString(),
          });
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [sessionId, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Verifying your payment...</p>
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
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-hero mb-6">
              Payment
              <span className="gradient-text"> Successful!</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Thank you for investing in your leadership development. We're excited to work with you!
            </p>
          </div>

          {/* Payment Details */}
          <div className="card-elevated p-8 rounded-2xl mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              Payment Confirmation
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground font-medium">Amount Paid:</span>
                  <span className="text-primary font-bold text-lg">
                    {paymentDetails?.totalAmount || paymentDetails?.amount || 'USD 0.00'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground font-medium">Service:</span>
                  <span className="text-foreground">{paymentDetails?.service}</span>
                </div>
                {paymentDetails?.baseAmount && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-foreground font-medium">Base Amount:</span>
                    <span className="text-foreground">{paymentDetails.baseAmount}</span>
                  </div>
                )}
                {paymentDetails?.bonusAmount && Number(paymentDetails.bonusAmount.replace(/[^\d.]/g, '')) > 0 && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-foreground font-medium">Bonus Amount:</span>
                    <span className="text-green-600 font-semibold">{paymentDetails.bonusAmount}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground font-medium">Invoice Number:</span>
                  <span className="text-foreground font-mono">{paymentDetails?.invoiceNumber || '—'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground font-medium">Email:</span>
                  <span className="text-foreground">{paymentDetails?.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground font-medium">Date:</span>
                  <span className="text-foreground">{paymentDetails?.date}</span>
                </div>
                {paymentDetails?.transactionId && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-foreground font-medium">Transaction ID:</span>
                    <span className="text-foreground font-mono text-sm">{paymentDetails.transactionId}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Bonus Amount Notice */}
            {paymentDetails?.bonusAmount && Number(paymentDetails.bonusAmount.replace(/[^\d.]/g, '')) > 0 && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-800 font-medium">
                    Thank you for your generous bonus payment! 
                  </span>
                </div>
                <p className="text-green-700 text-sm mt-1 ml-4">
                  Your additional contribution helps us continue providing exceptional leadership development services.
                </p>
              </div>
            )}
          </div>

        

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
              <a href="mailto:nobilis.talent@gmail.com" className="text-primary hover:underline">
                nobilis.talent@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer rendered globally in RootLayout */}
    </div>
  );
} 