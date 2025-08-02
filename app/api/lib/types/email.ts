/**
 * Backend email types for API routes
 */

import type { InvoicePreview } from '@/shared/types/payment';

export type EmailConfig = {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
};

export type EmailTemplate = {
  subject: string;
  html: string;
  text?: string;
};

export type EmailData = {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
};

export type InvoiceEmailData = {
  to: string;
  invoice: InvoicePreview;
  invoiceNumber: string;
  isPaymentComplete: boolean;
}; 