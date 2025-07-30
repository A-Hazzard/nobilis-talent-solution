export type PaymentOption = {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
};

export type PaymentSession = {
  sessionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  customerEmail?: string;
  metadata?: Record<string, string>;
};

export type PaymentConfirmation = {
  sessionId: string;
  amount: string;
  service: string;
  email: string;
  date: string;
  transactionId: string;
};

export type StripeWebhookEvent = {
  type: string;
  data: {
    object: any;
  };
};

// New types for dynamic payment links
export type PaymentLink = {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  description: string;
  status: 'active' | 'expired' | 'completed';
  createdAt: Date;
  expiresAt?: Date;
  stripePaymentLinkId?: string;
  stripeCheckoutSessionId?: string;
};

export type CreatePaymentLinkRequest = {
  clientName: string;
  clientEmail: string;
  amount: number;
  description: string;
  expiresInDays?: number;
};

export type PaymentLinkResponse = {
  id: string;
  paymentUrl: string;
  stripePaymentLinkId: string;
};

// New types for pending payments shown to logged-in users
export type PendingPayment = {
  id: string;
  clientEmail: string;
  clientName: string;
  baseAmount: number;
  description: string;
  status: 'pending' | 'completed' | 'cancelled' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  stripeSessionId?: string;
  notes?: string;
  updatedAt?: Date;
};

export type CreatePendingPaymentRequest = {
  clientEmail: string;
  clientName: string;
  baseAmount: number;
  description: string;
  expiresInDays?: number;
};

export type PendingPaymentResponse = {
  id: string;
  pendingPayment: PendingPayment;
}; 