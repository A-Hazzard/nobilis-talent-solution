import { CreatePaymentLinkRequest, PaymentLinkResponse } from '@/shared/types/payment';

export class PaymentLinkService {
  private static readonly API_BASE = '/api/payment';

  static async createPaymentLink(data: CreatePaymentLinkRequest): Promise<PaymentLinkResponse> {
    const response = await fetch(`${this.API_BASE}/create-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create payment link');
    }

    return response.json();
  }

  static formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  static generatePaymentDescription(clientName: string, serviceType: string = 'Leadership Consultation'): string {
    return `${serviceType} for ${clientName}`;
  }

  static validatePaymentLinkData(data: CreatePaymentLinkRequest): string[] {
    const errors: string[] = [];

    if (!data.clientName?.trim()) {
      errors.push('Client name is required');
    }

    if (!data.clientEmail?.trim()) {
      errors.push('Client email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.clientEmail)) {
      errors.push('Invalid email format');
    }

    if (!data.amount || data.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (!data.description?.trim()) {
      errors.push('Description is required');
    }

    return errors;
  }
} 