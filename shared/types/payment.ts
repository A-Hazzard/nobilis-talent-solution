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