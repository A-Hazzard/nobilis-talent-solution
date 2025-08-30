import { InvoiceService } from '@/lib/services/InvoiceService';
import type { 
  Invoice, 
  InvoiceItem, 
  CreateInvoiceRequest, 
  InvoicePreview 
} from '@/shared/types/payment';

// Mock fetch globally
global.fetch = jest.fn();

describe('InvoiceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date.now() for consistent testing
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2024-01-15').getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createInvoice', () => {
    const mockCreateRequest: CreateInvoiceRequest = {
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      clientAddress: '123 Main St, City, State 12345',
      items: [
        {
          description: 'Leadership Consultation',
          quantity: 2,
          unitPrice: 150,
        },
        {
          description: 'Workshop Materials',
          quantity: 1,
          unitPrice: 50,
        },
      ],
      notes: 'Thank you for your business',
      terms: 'Payment due within 30 days',
    };

    it('should create invoice successfully', async () => {
      const mockInvoice: Invoice = {
        id: 'inv_123',
        invoiceNumber: 'INV-202401-1234',
        ...mockCreateRequest,
        items: [
          {
            id: 'item-1',
            description: 'Leadership Consultation',
            quantity: 2,
            unitPrice: 150,
            total: 300,
          },
          {
            id: 'item-2',
            description: 'Workshop Materials',
            quantity: 1,
            unitPrice: 50,
            total: 50,
          },
        ],
        subtotal: 350,
        taxAmount: 28,
        total: 378,
        currency: 'USD',
        status: 'draft',
        issueDate: new Date('2024-01-15'),
        dueDate: new Date('2024-02-14'),
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockInvoice),
      });

      const result = await InvoiceService.createInvoice(mockCreateRequest);

      expect(fetch).toHaveBeenCalledWith('/api/payment/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"clientName":"John Doe"'),
      });

      expect(result).toEqual(mockInvoice);
    });

    it('should generate correct invoice number format', async () => {
      const mockInvoice = { id: 'inv_123' };
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockInvoice),
      });

      await InvoiceService.createInvoice(mockCreateRequest);

      const callBody = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.invoiceNumber).toMatch(/^INV-\d{6}-\d{4}$/);
      // Don't test specific month since test runs in different months
    });

    it('should calculate totals correctly', async () => {
      const mockInvoice = { id: 'inv_123' };
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockInvoice),
      });

      await InvoiceService.createInvoice(mockCreateRequest);

      const callBody = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.subtotal).toBe(350); // (2 * 150) + (1 * 50)
      expect(callBody.taxAmount).toBe(28); // 350 * 0.08
      expect(callBody.total).toBe(378); // 350 + 28
    });

    it('should set default due date to 30 days from now', async () => {
      const mockInvoice = { id: 'inv_123' };
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockInvoice),
      });

      const requestWithoutDueDate = { ...mockCreateRequest };
      delete requestWithoutDueDate.dueDate;

      await InvoiceService.createInvoice(requestWithoutDueDate);

      const callBody = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);
      const expectedDueDate = new Date('2024-02-14').toISOString(); // 30 days from 2024-01-15
      expect(new Date(callBody.dueDate).toISOString()).toBe(expectedDueDate);
    });

    it('should handle API error', async () => {
      const mockError = { error: 'Invalid client data' };
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(mockError),
      });

      await expect(InvoiceService.createInvoice(mockCreateRequest)).rejects.toThrow(
        'Invalid client data'
      );
    });

    it('should handle network error', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(InvoiceService.createInvoice(mockCreateRequest)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('getInvoice', () => {
    it('should fetch invoice successfully', async () => {
      const mockInvoice: Invoice = {
        id: 'inv_123',
        invoiceNumber: 'INV-202401-1234',
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        clientAddress: '123 Main St',
        items: [],
        subtotal: 100,
        taxAmount: 8,
        total: 108,
        currency: 'USD',
        status: 'sent',
        issueDate: new Date('2024-01-15'),
        dueDate: new Date('2024-02-14'),
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockInvoice),
      });

      const result = await InvoiceService.getInvoice('inv_123');

      expect(fetch).toHaveBeenCalledWith('/api/payment/invoices/inv_123');
      expect(result).toEqual(mockInvoice);
    });

    it('should handle invoice not found', async () => {
      const mockError = { error: 'Invoice not found' };
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(mockError),
      });

      await expect(InvoiceService.getInvoice('invalid_id')).rejects.toThrow(
        'Invoice not found'
      );
    });
  });

  describe('getInvoices', () => {
    it('should fetch all invoices successfully', async () => {
      const mockInvoices: Invoice[] = [
        {
          id: 'inv_123',
          invoiceNumber: 'INV-202401-1234',
          clientName: 'John Doe',
          clientEmail: 'john@example.com',
          clientAddress: '123 Main St',
          items: [],
          subtotal: 100,
          taxAmount: 8,
          total: 108,
          currency: 'USD',
          status: 'sent',
          issueDate: new Date('2024-01-15'),
          dueDate: new Date('2024-02-14'),
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
      ];

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockInvoices),
      });

      const result = await InvoiceService.getInvoices();

      expect(fetch).toHaveBeenCalledWith('/api/payment/invoices');
      expect(result).toEqual(mockInvoices);
    });

    it('should handle error fetching invoices', async () => {
      const mockError = { error: 'Database error' };
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(mockError),
      });

      await expect(InvoiceService.getInvoices()).rejects.toThrow('Database error');
    });
  });

  describe('updateInvoiceStatus', () => {
    it('should update invoice status successfully', async () => {
      const mockInvoice = { id: 'inv_123', status: 'paid' };
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockInvoice),
      });

      const result = await InvoiceService.updateInvoiceStatus('inv_123', 'paid');

      expect(fetch).toHaveBeenCalledWith('/api/payment/invoices/inv_123/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'paid' }),
      });
      expect(result).toEqual(mockInvoice);
    });

    it('should handle update status error', async () => {
      const mockError = { error: 'Invalid status' };
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(mockError),
      });

      await expect(
        InvoiceService.updateInvoiceStatus('inv_123', 'invalid_status' as any)
      ).rejects.toThrow('Invalid status');
    });
  });

  // Note: deleteInvoice method doesn't exist in current InvoiceService implementation

  describe('sendInvoice', () => {
    it('should send invoice successfully', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      // Should not throw an error
      await expect(InvoiceService.sendInvoice('inv_123')).resolves.not.toThrow();

      expect(fetch).toHaveBeenCalledWith('/api/payment/invoices/inv_123/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: undefined }),
      });
    });

    it('should handle send error', async () => {
      const mockError = { error: 'Email service unavailable' };
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(mockError),
      });

      await expect(InvoiceService.sendInvoice('inv_123')).rejects.toThrow(
        'Email service unavailable'
      );
    });
  });

  // Note: downloadInvoice method doesn't exist in current InvoiceService implementation

  describe('generatePreview', () => {
    it('should generate invoice preview correctly', () => {
      const mockRequest: CreateInvoiceRequest = {
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        clientAddress: '123 Main St',
        items: [
          {
            description: 'Consultation',
            quantity: 1,
            unitPrice: 200,
          },
        ],
        notes: 'Test invoice',
      };

      const preview = InvoiceService.generatePreview(mockRequest);

      expect(preview.invoiceNumber).toMatch(/^INV-\d{6}-\d{4}$/);
      expect(preview.clientName).toBe('John Doe');
      expect(preview.items).toHaveLength(1);
      expect(preview.items[0].total).toBe(200);
      expect(preview.subtotal).toBe(200);
      expect(preview.taxAmount).toBe(16); // 200 * 0.08
      expect(preview.total).toBe(216);
      // Note: status is not set in generatePreview method
    });

    it('should handle multiple items in preview', () => {
      const mockRequest: CreateInvoiceRequest = {
        clientName: 'Jane Smith',
        clientEmail: 'jane@example.com',
        clientAddress: '456 Oak Ave',
        items: [
          {
            description: 'Service A',
            quantity: 2,
            unitPrice: 100,
          },
          {
            description: 'Service B',
            quantity: 1,
            unitPrice: 150,
          },
        ],
      };

      const preview = InvoiceService.generatePreview(mockRequest);

      expect(preview.items).toHaveLength(2);
      expect(preview.subtotal).toBe(350); // (2 * 100) + (1 * 150)
      expect(preview.taxAmount).toBe(28); // 350 * 0.08
      expect(preview.total).toBe(378);
    });
  });
});
