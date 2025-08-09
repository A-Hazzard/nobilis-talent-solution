'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase/config';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | 'expired'>('pending');
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');
  const mode = searchParams.get('mode'); // 'verify' or 'resend'

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // If user is already verified, redirect to appropriate page
      if (user?.emailVerified) {
        router.push(user.role === 'admin' ? '/admin' : '/');
        return;
      }

      // Auto-verify if token is present
      if (token && mode === 'verify') {
        verifyEmail(token);
      }
    }
  }, [authLoading, isAuthenticated, user, token, mode, router]);

  const verifyEmail = async (verificationToken: string) => {
    setIsVerifying(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationStatus('success');
        setMessage('Your email has been successfully verified!');
        toast.success('Email verified successfully');
        
        // Refresh user data and redirect after a short delay
        setTimeout(() => {
          router.push(user?.role === 'admin' ? '/admin' : '/onboarding');
        }, 2000);
      } else {
        setVerificationStatus(data.error === 'Token expired' ? 'expired' : 'error');
        setMessage(data.error || 'Failed to verify email');
        toast.error(data.error || 'Failed to verify email');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setVerificationStatus('error');
      setMessage('Failed to verify email. Please try again.');
      toast.error('Failed to verify email');
    } finally {
      setIsVerifying(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (!user?.email) return;

    setIsResending(true);
    try {
      if (!auth.currentUser) {
        setMessage('Unauthorized');
        return;
      }
      // Use our branded server email
      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification email');
      }
      toast.success('Verification email sent! Please check your inbox.');
      setMessage('A new verification email has been sent to your inbox.');
    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error('Failed to send verification email');
      setMessage('Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderVerificationStatus = () => {
    switch (verificationStatus) {
      case 'success':
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Email Verified!</h2>
              <p className="text-gray-600">{message}</p>
            </div>
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Redirecting you to continue your setup...
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-2">Verification Failed</h2>
              <p className="text-gray-600">{message}</p>
            </div>
            <Button onClick={resendVerificationEmail} disabled={isResending}>
              {isResending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              Send New Verification Email
            </Button>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-yellow-800 mb-2">Link Expired</h2>
              <p className="text-gray-600">This verification link has expired. Please request a new one.</p>
            </div>
            <Button onClick={resendVerificationEmail} disabled={isResending}>
              {isResending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              Send New Verification Email
            </Button>
          </div>
        );

      default:
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              {isVerifying ? (
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              ) : (
                <Mail className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {isVerifying ? 'Verifying Email...' : 'Verify Your Email'}
              </h2>
              <p className="text-gray-600">
                {isVerifying 
                  ? 'Please wait while we verify your email address.'
                  : user?.email 
                    ? `We've sent a verification email to ${user.email}. Click the link in the email to verify your account.`
                    : 'Please check your email and click the verification link.'
                }
              </p>
            </div>
            
            {!isVerifying && !token && (
              <div className="space-y-4">
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    Didn't receive the email? Check your spam folder or request a new verification email.
                  </AlertDescription>
                </Alert>
                
                <Button onClick={resendVerificationEmail} disabled={isResending}>
                  {isResending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  Resend Verification Email
                </Button>
              </div>
            )}
            
            {message && verificationStatus === 'pending' && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            Complete your account setup by verifying your email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderVerificationStatus()}
        </CardContent>
      </Card>
    </div>
  );
}