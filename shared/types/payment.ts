

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
  status: 'active' | 'overdue' | 'completed';
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
  bonusAmount?: number; // Optional tip/bonus amount
  description: string;
  status: 'pending' | 'completed' | 'cancelled' | 'overdue';
  createdAt: Date;
  expiresAt?: Date;
  stripeSessionId?: string;
  notes?: string;
  updatedAt?: Date;
  invoiceNumber?: string;
};

export type CreatePendingPaymentRequest = {
  clientEmail: string;
  clientName: string;
  baseAmount: number;
  description: string;
  expiresInDays?: number;
  dueDate?: string;
};

export type PendingPaymentResponse = {
  id: string;
  pendingPayment: PendingPayment;
};

// Invoice types
export type Invoice = {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  notes?: string;
  terms?: string;
  paymentMethod?: string;
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: 'service' | 'product' | 'consultation';
};

export type CreateInvoiceRequest = {
  clientName: string;
  clientEmail: string;
  clientAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: Omit<InvoiceItem, 'id' | 'total'>[];
  notes?: string;
  terms?: string;
  dueDate?: Date;
};

export type InvoicePreview = {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  dueDate: Date;
  bonusAmount?: number; // Optional bonus amount
  notes?: string; // Optional notes including bonus information
}; 