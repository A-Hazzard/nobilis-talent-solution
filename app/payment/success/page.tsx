'use client'

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Calendar, Mail, ArrowRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // In a real application, you would verify the session with your backend
      // For now, we'll simulate the payment details
      setTimeout(() => {
        setPaymentDetails({
          amount: '$150.00',
          service: 'Leadership Consultation',
          email: 'customer@example.com',
          date: new Date().toLocaleDateString(),
        });
        setIsLoading(false);
      }, 1000);
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
          </div>
        </div>
        <Footer />
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
                  <span className="text-primary font-bold text-lg">{paymentDetails?.amount}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground font-medium">Service:</span>
                  <span className="text-foreground">{paymentDetails?.service}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground font-medium">Date:</span>
                  <span className="text-foreground">{paymentDetails?.date}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground font-medium">Transaction ID:</span>
                  <span className="text-muted-foreground font-mono text-sm">{sessionId}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">Confirmation Email</p>
                    <p className="text-sm text-muted-foreground">
                      We've sent a confirmation email to {paymentDetails?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">Next Steps</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive scheduling information within 24 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="card-elevated p-8 rounded-2xl mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              What Happens Next?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Confirmation Email</h3>
                <p className="text-sm text-muted-foreground">
                  You'll receive a detailed confirmation email with your purchase details
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Scheduling</h3>
                <p className="text-sm text-muted-foreground">
                  Our team will contact you within 24 hours to schedule your session
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Preparation</h3>
                <p className="text-sm text-muted-foreground">
                  You'll receive preparation materials to maximize your session value
                </p>
              </div>
            </div>
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
              <a href="mailto:hello@kareempayne.com" className="text-primary hover:underline">
                hello@kareempayne.com
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 