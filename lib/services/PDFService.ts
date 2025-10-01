import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

type InvoiceItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type InvoicePreview = {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount?: number;
  total: number;
  dueDate: Date;
};

/**
 * Backend PDF Service using pdf-lib (serverless-compatible)
 * Replaces Puppeteer/Chromium for backend PDF generation
 */
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
   * Generates an invoice PDF
   * @param invoice - Invoice data
   * @param invoiceNumber - Invoice number for filename
   * @returns Service response with PDF buffer
   */
  async generateInvoicePDF(
    invoice: InvoicePreview,
    invoiceNumber: string
  ): Promise<ServiceResponse<Buffer>> {
    try {
      // Create new PDF document
      const pdf = await PDFDocument.create();
      
      // Add page with Letter size
      const page = pdf.addPage([612, 792]); // 8.5" x 11"
      const { width, height } = page.getSize();
      
      // Embed fonts
      const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);
      
      // Define colors
      const BLACK = rgb(0, 0, 0);
      const GRAY = rgb(0.5, 0.5, 0.5);
      const ACCENT = rgb(0.2, 0.4, 0.6);
      const LIGHT_GRAY = rgb(0.95, 0.95, 0.95);
      
      // Margins
      const MARGIN = 50;
      let yPosition = height - MARGIN;
      
      // === HEADER SECTION ===
      
      // Company Name
      page.drawText('Nobilis Talent Solutions', {
        x: MARGIN,
        y: yPosition,
        size: 20,
        font: helveticaBold,
        color: ACCENT,
      });
      yPosition -= 25;
      
      // Company Details
      const fontSize = 9;
      page.drawText('Email: info@nobilistalentsolutions.com', {
        x: MARGIN,
        y: yPosition,
        size: fontSize,
        font: helvetica,
        color: GRAY,
      });
      yPosition -= 12;
      
      // Invoice Title
      yPosition -= 20;
      page.drawText('INVOICE', {
        x: width - MARGIN - 80,
        y: height - MARGIN,
        size: 24,
        font: helveticaBold,
        color: BLACK,
      });
      
      // Invoice Number
      page.drawText(`#${invoiceNumber}`, {
        x: width - MARGIN - 80,
        y: height - MARGIN - 25,
        size: 12,
        font: helvetica,
        color: GRAY,
      });
      
      // === SEPARATOR LINE ===
      yPosition -= 10;
      page.drawLine({
        start: { x: MARGIN, y: yPosition },
        end: { x: width - MARGIN, y: yPosition },
        color: ACCENT,
        thickness: 2,
      });
      yPosition -= 30;
      
      // === BILL TO SECTION ===
      page.drawText('BILL TO:', {
        x: MARGIN,
        y: yPosition,
        size: 10,
        font: helveticaBold,
        color: GRAY,
      });
      yPosition -= 15;
      
      page.drawText(invoice.clientName, {
        x: MARGIN,
        y: yPosition,
        size: 12,
        font: helveticaBold,
        color: BLACK,
      });
      yPosition -= 15;
      
      page.drawText(invoice.clientEmail, {
        x: MARGIN,
        y: yPosition,
        size: 10,
        font: helvetica,
        color: GRAY,
      });
      
      // === DATES SECTION ===
      const dateX = width - MARGIN - 150;
      let dateY = yPosition + 30;
      
      page.drawText('Due Date:', {
        x: dateX,
        y: dateY,
        size: 10,
        font: helveticaBold,
        color: GRAY,
      });
      
      page.drawText(this.formatDate(invoice.dueDate), {
        x: dateX + 80,
        y: dateY,
        size: 10,
        font: helvetica,
        color: BLACK,
      });
      
      yPosition -= 50;
      
      // === ITEMS TABLE ===
      // Table Header Background
      page.drawRectangle({
        x: MARGIN,
        y: yPosition - 15,
        width: width - (MARGIN * 2),
        height: 20,
        color: LIGHT_GRAY,
      });
      
      // Table Headers
      const tableY = yPosition - 5;
      page.drawText('Description', {
        x: MARGIN + 5,
        y: tableY,
        size: 10,
        font: helveticaBold,
        color: BLACK,
      });
      
      page.drawText('Qty', {
        x: width - MARGIN - 200,
        y: tableY,
        size: 10,
        font: helveticaBold,
        color: BLACK,
      });
      
      page.drawText('Unit Price', {
        x: width - MARGIN - 140,
        y: tableY,
        size: 10,
        font: helveticaBold,
        color: BLACK,
      });
      
      page.drawText('Total', {
        x: width - MARGIN - 60,
        y: tableY,
        size: 10,
        font: helveticaBold,
        color: BLACK,
      });
      
      yPosition -= 30;
      
      // Table Items
      for (const item of invoice.items) {
        if (yPosition < 150) {
          // Create new page if needed
          const newPage = pdf.addPage([612, 792]);
          yPosition = height - MARGIN;
          
          newPage.drawText(item.description.substring(0, 60), {
            x: MARGIN + 5,
            y: yPosition,
            size: 10,
            font: helvetica,
            color: BLACK,
          });
          
          newPage.drawText(item.quantity.toString(), {
            x: width - MARGIN - 200,
            y: yPosition,
            size: 10,
            font: helvetica,
            color: BLACK,
          });
          
          newPage.drawText(this.formatCurrency(item.unitPrice), {
            x: width - MARGIN - 140,
            y: yPosition,
            size: 10,
            font: helvetica,
            color: BLACK,
          });
          
          newPage.drawText(this.formatCurrency(item.total), {
            x: width - MARGIN - 60,
            y: yPosition,
            size: 10,
            font: helvetica,
            color: BLACK,
          });
        } else {
          page.drawText(item.description.substring(0, 60), {
            x: MARGIN + 5,
            y: yPosition,
            size: 10,
            font: helvetica,
            color: BLACK,
          });
          
          page.drawText(item.quantity.toString(), {
            x: width - MARGIN - 200,
            y: yPosition,
            size: 10,
            font: helvetica,
            color: BLACK,
          });
          
          page.drawText(this.formatCurrency(item.unitPrice), {
            x: width - MARGIN - 140,
            y: yPosition,
            size: 10,
            font: helvetica,
            color: BLACK,
          });
          
          page.drawText(this.formatCurrency(item.total), {
            x: width - MARGIN - 60,
            y: yPosition,
            size: 10,
            font: helvetica,
            color: BLACK,
          });
        }
        yPosition -= 20;
      }
      
      // Separator line after items
      yPosition -= 10;
      page.drawLine({
        start: { x: MARGIN, y: yPosition },
        end: { x: width - MARGIN, y: yPosition },
        color: GRAY,
        thickness: 1,
      });
      yPosition -= 20;
      
      // === TOTALS SECTION ===
      const totalsX = width - MARGIN - 150;
      
      // Subtotal
      page.drawText('Subtotal:', {
        x: totalsX,
        y: yPosition,
        size: 10,
        font: helvetica,
        color: BLACK,
      });
      
      page.drawText(this.formatCurrency(invoice.subtotal), {
        x: totalsX + 80,
        y: yPosition,
        size: 10,
        font: helvetica,
        color: BLACK,
      });
      yPosition -= 15;
      
      // Tax (if applicable)
      if (invoice.taxAmount && invoice.taxAmount > 0) {
        page.drawText('Tax:', {
          x: totalsX,
          y: yPosition,
          size: 10,
          font: helvetica,
          color: BLACK,
        });
        
        page.drawText(this.formatCurrency(invoice.taxAmount), {
          x: totalsX + 80,
          y: yPosition,
          size: 10,
          font: helvetica,
          color: BLACK,
        });
        yPosition -= 15;
      }
      
      // Total (highlighted)
      page.drawRectangle({
        x: totalsX - 5,
        y: yPosition - 5,
        width: 155,
        height: 20,
        color: ACCENT,
      });
      
      page.drawText('TOTAL:', {
        x: totalsX,
        y: yPosition,
        size: 12,
        font: helveticaBold,
        color: rgb(1, 1, 1), // White
      });
      
      page.drawText(this.formatCurrency(invoice.total), {
        x: totalsX + 80,
        y: yPosition,
        size: 12,
        font: helveticaBold,
        color: rgb(1, 1, 1), // White
      });
      
      // === FOOTER ===
      page.drawText('Thank you for your business!', {
        x: width / 2 - 70,
        y: 30,
        size: 10,
        font: helveticaBold,
        color: GRAY,
      });
      
      // Save and return as Buffer
      const pdfBytes = await pdf.save();
      const buffer = Buffer.from(pdfBytes);
      
      return {
        success: true,
        data: buffer,
      };
    } catch (error) {
      console.error('PDF generation failed:', error);
      return {
        success: false,
        error: `Failed to generate invoice PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Gets the filename for an invoice
   */
  getInvoiceFilename(invoiceNumber: string): string {
    return `invoice-${invoiceNumber}.pdf`;
  }

  /**
   * Formats currency values
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  }

  /**
   * Formats date strings
   */
  private formatDate(date: Date | string): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}

