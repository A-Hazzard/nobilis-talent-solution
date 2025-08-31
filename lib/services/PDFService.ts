import type { InvoicePreview } from '@/shared/types/payment';
import type { PDFOptions } from '@/lib/types/services';
import puppeteer from 'puppeteer';

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
      month: 'short',
      day: 'numeric',
    });

    const dueDate = invoice.dueDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    // Convert logo to base64 for embedding
    const fs = require('fs');
    const path = require('path');
    let logoBase64 = '';
    
    try {
      const logoPath = path.join(process.cwd(), 'public', 'assets', 'logo-transparent.png');
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    } catch (error) {
      console.warn('Could not load logo for PDF:', error);
    }

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice #${invoiceNumber}</title>
    <style>
        @page {
            size: ${options.format || 'A4'};
            margin: ${options.margin?.top || '15mm'} ${options.margin?.right || '15mm'} ${options.margin?.bottom || '15mm'} ${options.margin?.left || '15mm'};
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: #fff;
        }
        
        .invoice-container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 20px;
        }
        
        .logo-section {
            flex: 1;
        }
        
        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 15px;
        }
        
        .company-info {
            font-size: 11px;
            line-height: 1.4;
            color: #555;
        }
        
        .invoice-header {
            flex: 1;
            text-align: right;
        }
        
        .invoice-title {
            font-size: 32px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
            letter-spacing: 2px;
        }
        
        .invoice-number {
            font-size: 14px;
            color: #888;
            margin-bottom: 20px;
        }
        
        .invoice-dates {
            text-align: right;
            font-size: 11px;
            line-height: 1.6;
        }
        
        .date-row {
            margin-bottom: 5px;
        }
        
        .date-label {
            display: inline-block;
            width: 60px;
            text-align: left;
            color: #666;
        }
        
        .balance-due {
            margin-top: 15px;
            padding: 10px;
            background-color: #f8f9fa;
            border-left: 4px solid #ff6b35;
        }
        
        .balance-label {
            font-size: 11px;
            color: #666;
            margin-bottom: 2px;
        }
        
        .balance-amount {
            font-size: 16px;
            font-weight: bold;
            color: #333;
        }
        
        .billing-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        
        .bill-to {
            flex: 1;
        }
        
        .bill-to h3 {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        
        .client-details {
            font-size: 11px;
            line-height: 1.5;
            color: #555;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            border: 1px solid #ddd;
        }
        
        .items-table th {
            background-color: #4a4a4a;
            color: white;
            padding: 12px 15px;
            text-align: left;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .items-table th.center {
            text-align: center;
        }
        
        .items-table th.right {
            text-align: right;
        }
        
        .items-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
            font-size: 11px;
        }
        
        .items-table td.center {
            text-align: center;
        }
        
        .items-table td.right {
            text-align: right;
        }
        
        .items-table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .totals-section {
            margin-top: 30px;
            text-align: right;
        }
        
        .totals-table {
            margin-left: auto;
            width: 300px;
        }
        
        .totals-table tr td {
            padding: 8px 15px;
            font-size: 11px;
        }
        
        .totals-table tr td:first-child {
            text-align: right;
            color: #666;
        }
        
        .totals-table tr td:last-child {
            text-align: right;
            font-weight: bold;
            width: 100px;
        }
        
        .total-row {
            border-top: 2px solid #333;
            font-size: 12px !important;
        }
        
        .total-row td {
            padding-top: 12px !important;
            font-weight: bold !important;
            color: #333 !important;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header Section -->
        <div class="header">
            <div class="logo-section">
                ${logoBase64 ? `<img src="${logoBase64}" alt="Company Logo" class="logo" />` : ''}
                <div class="company-info">
                    <strong>Nobilis Talent Solutions</strong><br>
                    Aaron Hazzard<br>
                    Available globally<br>
                    Phone: +1 (678) 920-6605<br>
                    Email: nobilis.talent@gmail.com
                </div>
            </div>
            
            <div class="invoice-header">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number">#${invoiceNumber}</div>
                
                <div class="invoice-dates">
                    <div class="date-row">
                        <span class="date-label">Date:</span>
                        <span>${invoiceDate}</span>
                    </div>
                    <div class="date-row">
                        <span class="date-label">Due Date:</span>
                        <span>${dueDate}</span>
                    </div>
                </div>
                
                <div class="balance-due">
                    <div class="balance-label">Balance Due:</div>
                    <div class="balance-amount">$${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
            </div>
        </div>
        
        <!-- Billing Section -->
        <div class="billing-section">
            <div class="bill-to">
                <h3>Bill To:</h3>
                <div class="client-details">
                    ${invoice.clientName}<br>
                    ${invoice.clientEmail || ''}
                </div>
            </div>
        </div>
        
        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th class="center">Quantity</th>
                    <th class="right">Rate</th>
                    <th class="right">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.items.map(item => `
                    <tr>
                        <td>${item.description}</td>
                        <td class="center">${item.quantity}</td>
                        <td class="right">$${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td class="right">$${item.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <!-- Totals Section -->
        <div class="totals-section">
            <table class="totals-table">
                <tr>
                    <td>Subtotal:</td>
                    <td>$${invoice.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                    <td>Tax (0%):</td>
                    <td>$${invoice.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr class="total-row">
                    <td>Total:</td>
                    <td>$${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate invoice PDF using Puppeteer
   */
  async generateInvoicePDF(
    invoice: InvoicePreview, 
    invoiceNumber: string, 
    options: PDFOptions = {}
  ): Promise<{ success: boolean; data?: Buffer; error?: string }> {
    let browser;
    try {
      console.log('🚀 PDFService: Starting PDF generation for invoice:', invoiceNumber);
      console.log('🚀 PDFService: Invoice data:', {
        clientName: invoice.clientName,
        total: invoice.total,
        itemsCount: invoice.items?.length,
        dueDate: invoice.dueDate
      });
      
      // Generate the HTML content
      const html = this.generateInvoiceHTML(invoice, invoiceNumber, options);
      
      console.log('✅ PDFService: Invoice HTML generated successfully, length:', html.length);
      
      // Launch Puppeteer browser
      console.log('🌐 PDFService: Launching Puppeteer browser...');
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
      
      console.log('✅ PDFService: Browser launched successfully');
      
      const page = await browser.newPage();
      
      // Set content and wait for it to load
      console.log('📄 PDFService: Setting page content...');
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      console.log('✅ PDFService: Page content set, generating PDF...');
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        printBackground: true,
        margin: {
          top: options.margin?.top || '15mm',
          right: options.margin?.right || '15mm',
          bottom: options.margin?.bottom || '15mm',
          left: options.margin?.left || '15mm'
        }
      });
      
      console.log('✅ PDFService: PDF generated successfully, size:', pdfBuffer.length, 'bytes');
      
      return {
        success: true,
        data: Buffer.from(pdfBuffer)
      };
    } catch (error) {
      console.error('❌ PDFService: Error generating invoice PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      if (browser) {
        console.log('🔒 PDFService: Closing browser...');
        await browser.close();
      }
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