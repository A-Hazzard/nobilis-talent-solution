import type { InvoicePreview } from '@/shared/types/payment';
import type { PDFOptions } from '@/lib/types/services';

export class PDFService {
  private static instance: PDFService;

  private constructor() {}

  static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  /**
   * Generate invoice HTML
   */
  private generateInvoiceHTML(invoice: InvoicePreview, invoiceNumber: string, options: PDFOptions = {}): string {
    const invoiceDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice #${invoiceNumber}</title>
    <style>
        @page {
            size: ${options.format || 'A4'};
            margin: ${options.margin?.top || '20mm'} ${options.margin?.right || '20mm'} ${options.margin?.bottom || '20mm'} ${options.margin?.left || '20mm'};
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #667eea;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
        
        .company-details {
            font-size: 12px;
            color: #666;
        }
        
        .invoice-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        
        .client-info, .invoice-details {
            flex: 1;
        }
        
        .invoice-title {
            font-size: 20px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        
        .invoice-number {
            font-size: 16px;
            color: #667eea;
            margin-bottom: 5px;
        }
        
        .date-info {
            font-size: 12px;
            color: #666;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        .items-table th {
            background-color: #f8f9fa;
            padding: 12px;
            text-align: left;
            border-bottom: 2px solid #dee2e6;
            font-weight: bold;
        }
        
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #dee2e6;
        }
        
        .items-table .description {
            width: 60%;
        }
        
        .items-table .amount {
            width: 40%;
            text-align: right;
        }
        
        .total-section {
            text-align: right;
            margin-top: 20px;
        }
        
        .total-row {
            font-size: 16px;
            font-weight: bold;
            padding: 10px 0;
        }
        
        .total-amount {
            font-size: 20px;
            color: #667eea;
            border-top: 2px solid #667eea;
            padding-top: 10px;
        }
        
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #dee2e6;
            padding-top: 20px;
        }
        
        .payment-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }
        
        .payment-info h4 {
            margin: 0 0 10px 0;
            color: #333;
        }
        
        .payment-info p {
            margin: 5px 0;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">Payne Leadership</div>
        <div class="company-details">
            123 Business Street<br>
            City, State 12345<br>
            Phone: +1 (555) 123-4567<br>
            Email: contact@payneleadership.com
        </div>
    </div>
    
    <div class="invoice-info">
        <div class="client-info">
            <div class="invoice-title">Bill To:</div>
            <div style="font-size: 14px; margin-bottom: 10px;">
                ${invoice.clientName}<br>
                ${invoice.clientEmail || ''}
            </div>
        </div>
        
        <div class="invoice-details">
            <div class="invoice-title">Invoice</div>
            <div class="invoice-number">#${invoiceNumber}</div>
            <div class="date-info">
                <strong>Date:</strong> ${invoiceDate}<br>
                <strong>Due Date:</strong> ${dueDate}
            </div>
        </div>
    </div>
    
    <table class="items-table">
        <thead>
            <tr>
                <th class="description">Description</th>
                <th class="amount">Amount</th>
            </tr>
        </thead>
                 <tbody>
             ${invoice.items.map(item => `
                 <tr>
                     <td class="description">${item.description}</td>
                     <td class="amount">$${item.total.toFixed(2)}</td>
                 </tr>
             `).join('')}
         </tbody>
    </table>
    
    <div class="total-section">
        <div class="total-row">
            <span>Total:</span>
            <span class="total-amount">$${invoice.total.toFixed(2)}</span>
        </div>
    </div>
    
    <div class="payment-info">
        <h4>Payment Information</h4>
        <p><strong>Payment Method:</strong> Credit Card / Bank Transfer</p>
        <p><strong>Payment Terms:</strong> Net 30</p>
        <p><strong>Due Date:</strong> ${dueDate}</p>
        <p>Please include invoice number #${invoiceNumber} with your payment.</p>
    </div>
    
    <div class="footer">
        <p>Thank you for your business!</p>
        <p>Payne Leadership | Professional Development & Leadership Consulting</p>
    </div>
</body>
</html>`;
  }

  /**
   * Generate invoice PDF (placeholder - would integrate with actual PDF library)
   */
  async generateInvoicePDF(
    invoice: InvoicePreview, 
    invoiceNumber: string, 
    options: PDFOptions = {}
  ): Promise<{ success: boolean; data?: Buffer; error?: string }> {
    try {
      // Generate the HTML content
      const html = this.generateInvoiceHTML(invoice, invoiceNumber, options);
      
      // For now, return the HTML as a string
      // In a real implementation, this would convert HTML to PDF using a library like Puppeteer
      // or a service like wkhtmltopdf
      
      console.log('Invoice HTML generated successfully');
      
      // Placeholder: In a real implementation, you would:
      // 1. Use Puppeteer to convert HTML to PDF
      // 2. Return the PDF buffer
      // 3. Handle proper PDF generation
      
      return {
        success: true,
        data: Buffer.from(html, 'utf-8'), // Placeholder - would be actual PDF buffer
        error: 'PDF generation not fully implemented - HTML returned instead'
      };
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate invoice HTML for email attachment
   */
  async generateInvoiceHTMLForEmail(
    invoice: InvoicePreview, 
    invoiceNumber: string
  ): Promise<string> {
    return this.generateInvoiceHTML(invoice, invoiceNumber);
  }

  /**
   * Get invoice filename
   */
  getInvoiceFilename(invoiceNumber: string): string {
    const date = new Date().toISOString().split('T')[0];
    return `invoice-${invoiceNumber}-${date}.pdf`;
  }
} 