import { useState, useEffect } from 'react';
import type { PendingPayment } from '@/shared/types/payment';

export function usePendingPayment(userEmail?: string) {
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasCompletedPayment, setHasCompletedPayment] = useState(false);
  const [shouldShowPaymentButton, setShouldShowPaymentButton] = useState(false);

  useEffect(() => {
    // Allow checking payment status even without user email
    // This enables checking for payment status independently of user authentication

    const checkPendingPayment = async () => {
      setIsLoading(true);
      setError('');

      try {
        // Build URL with email parameter only if userEmail is provided
        const url = userEmail 
          ? `/api/payment/user-status?email=${encodeURIComponent(userEmail)}`
          : '/api/payment/user-status';
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to check payment status`);
        }

        const data = await response.json();
        setPendingPayment(data.pendingPayment);
        setHasCompletedPayment(data.hasCompletedPayment);
        setShouldShowPaymentButton(data.shouldShowPaymentButton || false);
      } catch (err) {
        console.error('Error checking payment status:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to check payment status';
        setError(errorMessage);
        setPendingPayment(null);
        setHasCompletedPayment(false);
        setShouldShowPaymentButton(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPendingPayment();
  }, [userEmail]);

  return {
    pendingPayment,
    isLoading,
    error,
    hasPendingPayment: !!pendingPayment,
    hasCompletedPayment,
    // Use the API's determination for showing payment button
    shouldShowPaymentButton,
  };
} 