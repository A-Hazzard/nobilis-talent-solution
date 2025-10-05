import type { 
  Invoice, 
  InvoiceItem, 
  CreateInvoiceRequest, 
  InvoicePreview 
} from '@/shared/types/payment';

export class InvoiceService {
  private static readonly API_BASE = '/api/payment/invoices';

  /**
   * Generate a unique invoice number
   */
  private static generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  }

  /**
   * Calculate invoice totals
   */
  private static calculateTotals(items: Omit<InvoiceItem, 'id' | 'total'>[]): {
    subtotal: number;
    taxAmount: number;
    total: number;
  } {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxRate = 0.08; // 8% tax rate - can be made configurable
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    return { subtotal, taxAmount, total };
  }

  /**
   * Create a new invoice
   */
  static async createInvoice(request: CreateInvoiceRequest): Promise<Invoice> {
    const invoiceNumber = this.generateInvoiceNumber();
    const { subtotal, taxAmount, total } = this.calculateTotals(request.items);
    
    const invoiceData = {
      invoiceNumber,
      clientName: request.clientName,
      clientEmail: request.clientEmail,
      clientAddress: request.clientAddress,
      items: request.items.map((item, index) => ({
        id: `item-${index + 1}`,
        ...item,
        total: item.quantity * item.unitPrice
      })),
      subtotal,
      taxAmount,
      total,
      currency: 'USD',
      status: 'draft' as const,
      issueDate: new Date(),
      dueDate: request.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes: request.notes,
      terms: request.terms || 'Payment is due within 30 days of invoice date.',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const response = await fetch(this.API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create invoice');
    }

    return response.json();
  }

  /**
   * Get invoice by ID
   */
  static async getInvoice(invoiceId: string): Promise<Invoice> {
    const response = await fetch(`${this.API_BASE}/${invoiceId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch invoice');
    }

    return response.json();
  }

  /**
   * Get all invoices
   */
  static async getInvoices(): Promise<Invoice[]> {
    const response = await fetch(this.API_BASE);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch invoices');
    }

    return response.json();
  }

  /**
   * Update invoice status
   */
  static async updateInvoiceStatus(invoiceId: string, status: Invoice['status']): Promise<Invoice> {
    const response = await fetch(`${this.API_BASE}/${invoiceId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update invoice status');
    }

    return response.json();
  }

  /**
   * Mark invoice as paid
   */
  static async markInvoiceAsPaid(invoiceId: string, paymentMethod?: string): Promise<Invoice> {
    const response = await fetch(`${this.API_BASE}/${invoiceId}/mark-paid`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        status: 'paid',
        paidDate: new Date(),
        paymentMethod 
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to mark invoice as paid');
    }

    return response.json();
  }

  /**
   * Generate invoice preview
   */
  static generatePreview(request: CreateInvoiceRequest): InvoicePreview {
    const invoiceNumber = this.generateInvoiceNumber();
    const { subtotal, taxAmount, total } = this.calculateTotals(request.items);
    
    return {
      invoiceNumber,
      clientName: request.clientName,
      clientEmail: request.clientEmail,
      items: request.items.map((item, index) => ({
        id: `item-${index + 1}`,
        ...item,
        total: item.quantity * item.unitPrice
      })),
      subtotal,
      taxAmount,
      total,
      dueDate: request.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };
  }

  /**
   * Download invoice as PDF
   */
  static async downloadInvoicePDF(invoiceId: string): Promise<Blob> {
    const response = await fetch(`${this.API_BASE}/${invoiceId}/pdf`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate PDF');
    }

    return response.blob();
  }

  /**
   * Send invoice via email
   */
  static async sendInvoice(invoiceId: string, email?: string): Promise<void> {
    const response = await fetch(`${this.API_BASE}/${invoiceId}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send invoice');
    }
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  /**
   * Format date
   */
  static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  /**
   * Get invoice status badge color
   */
  static getStatusColor(status: Invoice['status']): string {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || colors.draft;
  }


} 