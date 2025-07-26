import { PaymentOption, PaymentSession } from '@/shared/types/payment';

export class PaymentService {
  private static readonly API_BASE = '/api/payment';

  static async createCheckoutSession(optionId: string): Promise<{ sessionId: string }> {
    const response = await fetch(`${this.API_BASE}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ optionId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    return response.json();
  }

  static async verifySession(sessionId: string): Promise<PaymentSession> {
    const response = await fetch(`${this.API_BASE}/verify-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to verify session');
    }

    return response.json();
  }

  static getPaymentOptions(): PaymentOption[] {
    return [
      {
        id: 'consultation',
        title: 'Leadership Consultation',
        description: 'One-on-one leadership coaching session',
        price: 150,
        duration: '60 minutes',
        features: [
          'Personalized leadership assessment',
          'Goal setting and action planning',
          'Follow-up resources and materials',
          '30-day email support'
        ]
      },
      {
        id: 'workshop',
        title: 'Team Workshop',
        description: 'Group leadership development workshop',
        price: 500,
        duration: 'Half-day session',
        features: [
          'Interactive team exercises',
          'Leadership skill development',
          'Team dynamics analysis',
          'Custom workshop materials',
          'Post-workshop assessment'
        ]
      },
      {
        id: 'retreat',
        title: 'Leadership Retreat',
        description: 'Comprehensive leadership development program',
        price: 2500,
        duration: '2-day intensive',
        features: [
          'Comprehensive leadership assessment',
          'Strategic planning session',
          'Team building activities',
          'Personal development plan',
          '3-month follow-up support',
          'All materials and resources included'
        ]
      }
    ];
  }

  static formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }
} 