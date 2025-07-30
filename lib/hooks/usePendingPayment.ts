import { useState, useEffect } from 'react';
import type { PendingPayment } from '@/shared/types/payment';

export function usePendingPayment(userEmail?: string) {
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userEmail) {
      setPendingPayment(null);
      return;
    }

    const checkPendingPayment = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/payment/create-pending?email=${encodeURIComponent(userEmail)}`);
        
        if (response.status === 404) {
          // No pending payment found - this is normal
          setPendingPayment(null);
          return;
        }
        
        if (response.status === 410) {
          // Payment expired
          setPendingPayment(null);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to check pending payment');
        }

        const data = await response.json();
        setPendingPayment(data.pendingPayment);
      } catch (err) {
        console.error('Error checking pending payment:', err);
        setError(err instanceof Error ? err.message : 'Failed to check payment');
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
  };
} 