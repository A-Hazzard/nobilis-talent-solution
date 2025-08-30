import { PDFService } from '@/lib/services/PDFService';
import type { InvoicePreview } from '@/shared/types/payment';
import type { PDFOptions } from '@/lib/types/services';
import puppeteer from 'puppeteer';

// Mock puppeteer
jest.mock('puppeteer', () => ({
  launch: jest.fn(),
}));

const mockPuppeteer = puppeteer as jest.Mocked<typeof puppeteer>;

describe('PDFService', () => {
  let pdfService: PDFService;
  let mockBrowser: any;
  let mockPage: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockPage = {
      setContent: jest.fn(),
      pdf: jest.fn(),
      close: jest.fn(),
    };

    mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn(),
    };

    mockPuppeteer.launch.mockResolvedValue(mockBrowser);
    
    pdfService = PDFService.getInstance();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = PDFService.getInstance();
      const instance2 = PDFService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('generateInvoicePDF', () => {
    const mockInvoice: InvoicePreview = {
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      clientPhone: '123-456-7890',
      clientAddress: '123 Main St, City, State 12345',
      items: [
        {
          description: 'Leadership Coaching Session',
          quantity: 2,
          unitPrice: 500,
          total: 1000,
        },
        {
          description: 'Team Workshop',
          quantity: 1,
          unitPrice: 1500,
          total: 1500,
        },
      ],
      subtotal: 2500,
      taxRate: 0.08,
      taxAmount: 200,
      total: 2700,
      notes: 'Thank you for your business!',
      dueDate: new Date('2024-02-15'),
    };

    const mockInvoiceNumber = 'INV-202401-001';

    it('should generate PDF successfully with default options', async () => {
      const mockPDFBuffer = Buffer.from('mock-pdf-data');
      mockPage.pdf.mockResolvedValue(mockPDFBuffer);

      const result = await pdfService.generateInvoicePDF(mockInvoice, mockInvoiceNumber);

      expect(result.error).toBeUndefined();
      expect(result.data).toStrictEqual(mockPDFBuffer);
      expect(mockPuppeteer.launch).toHaveBeenCalledWith({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      expect(mockPage.setContent).toHaveBeenCalled();
      expect(mockPage.pdf).toHaveBeenCalledWith({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
      });
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should generate PDF with custom options', async () => {
      const mockPDFBuffer = Buffer.from('mock-pdf-data');
      mockPage.pdf.mockResolvedValue(mockPDFBuffer);

      const customOptions: PDFOptions = {
        format: 'Letter',
        margin: {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm',
        },
        printBackground: false,
      };

      const result = await pdfService.generateInvoicePDF(mockInvoice, mockInvoiceNumber, customOptions);

      expect(result.error).toBeUndefined();
      expect(result.data).toStrictEqual(mockPDFBuffer);
      expect(mockPage.pdf).toHaveBeenCalledWith({
        format: 'Letter',
        printBackground: true,
        margin: {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm',
        },
      });
    });

    it('should include all invoice data in HTML', async () => {
      const mockPDFBuffer = Buffer.from('mock-pdf-data');
      mockPage.pdf.mockResolvedValue(mockPDFBuffer);

      await pdfService.generateInvoicePDF(mockInvoice, mockInvoiceNumber);

      const htmlContent = mockPage.setContent.mock.calls[0][0];
      
      // Check that key invoice data is included in the HTML
      expect(htmlContent).toContain(mockInvoiceNumber);
      expect(htmlContent).toContain(mockInvoice.clientName);
      expect(htmlContent).toContain(mockInvoice.clientEmail);
      expect(htmlContent).toContain('Leadership Coaching Session');
      expect(htmlContent).toContain('Team Workshop');
      expect(htmlContent).toContain('$1000.00'); // First item total
      expect(htmlContent).toContain('$1500.00'); // Second item total  
      expect(htmlContent).toContain('$2700.00'); // Total
      expect(htmlContent).toContain(mockInvoice.notes);
    });

    it('should format dates correctly', async () => {
      const mockPDFBuffer = Buffer.from('mock-pdf-data');
      mockPage.pdf.mockResolvedValue(mockPDFBuffer);

      await pdfService.generateInvoicePDF(mockInvoice, mockInvoiceNumber);

      const htmlContent = mockPage.setContent.mock.calls[0][0];
      
      // Check date formatting (should contain February and 2024)
      expect(htmlContent).toMatch(/February \d{1,2}, 2024/);
    });

    it('should handle puppeteer launch errors', async () => {
      mockPuppeteer.launch.mockRejectedValue(new Error('Failed to launch browser'));

      const result = await pdfService.generateInvoicePDF(mockInvoice, mockInvoiceNumber);

      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Failed to launch browser');
    });

    it('should handle page creation errors', async () => {
      mockBrowser.newPage.mockRejectedValue(new Error('Failed to create page'));

      const result = await pdfService.generateInvoicePDF(mockInvoice, mockInvoiceNumber);

      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Failed to create page');
      expect(mockBrowser.close).toHaveBeenCalled(); // Should still close browser
    });

    it('should handle PDF generation errors', async () => {
      mockPage.pdf.mockRejectedValue(new Error('PDF generation failed'));

      const result = await pdfService.generateInvoicePDF(mockInvoice, mockInvoiceNumber);

      expect(result.data).toBeUndefined();
      expect(result.error).toBe('PDF generation failed');
      expect(mockBrowser.close).toHaveBeenCalled(); // Should still close browser
    });

    it('should close browser even if errors occur', async () => {
      mockPage.setContent.mockRejectedValue(new Error('Set content failed'));

      const result = await pdfService.generateInvoicePDF(mockInvoice, mockInvoiceNumber);

      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Set content failed');
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should handle invoice with no items', async () => {
      const emptyInvoice: InvoicePreview = {
        ...mockInvoice,
        items: [],
        subtotal: 0,
        taxAmount: 0,
        total: 0,
      };

      const mockPDFBuffer = Buffer.from('mock-pdf-data');
      mockPage.pdf.mockResolvedValue(mockPDFBuffer);

      const result = await pdfService.generateInvoicePDF(emptyInvoice, mockInvoiceNumber);

      expect(result.error).toBeUndefined();
      expect(result.data).toStrictEqual(mockPDFBuffer);
    });

    it('should handle invoice with no notes', async () => {
      const invoiceWithoutNotes: InvoicePreview = {
        ...mockInvoice,
        notes: '',
      };

      const mockPDFBuffer = Buffer.from('mock-pdf-data');
      mockPage.pdf.mockResolvedValue(mockPDFBuffer);

      const result = await pdfService.generateInvoicePDF(invoiceWithoutNotes, mockInvoiceNumber);

      expect(result.error).toBeUndefined();
      expect(result.data).toStrictEqual(mockPDFBuffer);
    });

    it('should format currency values correctly', async () => {
      const mockPDFBuffer = Buffer.from('mock-pdf-data');
      mockPage.pdf.mockResolvedValue(mockPDFBuffer);

      await pdfService.generateInvoicePDF(mockInvoice, mockInvoiceNumber);

      const htmlContent = mockPage.setContent.mock.calls[0][0];
      
      // Check currency formatting
      expect(htmlContent).toContain('$1000.00'); // First line total
      expect(htmlContent).toContain('$1500.00'); // Second line total
      expect(htmlContent).toContain('$2700.00'); // Grand total
    });

    it('should include proper HTML structure', async () => {
      const mockPDFBuffer = Buffer.from('mock-pdf-data');
      mockPage.pdf.mockResolvedValue(mockPDFBuffer);

      await pdfService.generateInvoicePDF(mockInvoice, mockInvoiceNumber);

      const htmlContent = mockPage.setContent.mock.calls[0][0];
      
      // Check HTML structure
      expect(htmlContent).toContain('<!DOCTYPE html>');
      expect(htmlContent).toContain('<html>');
      expect(htmlContent).toContain('<head>');
      expect(htmlContent).toContain('<body>');
      expect(htmlContent).toContain('<style>');
      expect(htmlContent).toContain('</html>');
    });

    it('should include CSS styling', async () => {
      const mockPDFBuffer = Buffer.from('mock-pdf-data');
      mockPage.pdf.mockResolvedValue(mockPDFBuffer);

      await pdfService.generateInvoicePDF(mockInvoice, mockInvoiceNumber);

      const htmlContent = mockPage.setContent.mock.calls[0][0];
      
      // Check CSS classes are present
      expect(htmlContent).toContain('company-name');
      expect(htmlContent).toContain('invoice-title');
      expect(htmlContent).toContain('items-table');
      expect(htmlContent).toContain('total-section');
    });
  });
});
