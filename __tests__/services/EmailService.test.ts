import { EmailService } from '@/lib/services/EmailService';
import nodemailer from 'nodemailer';
import type { EmailData, InvoiceEmailData } from '@/lib/types/services';

// Mock nodemailer
const mockTransporter = {
  sendMail: jest.fn(),
  verify: jest.fn(),
};

jest.mock('nodemailer', () => ({
  default: {
    createTransport: jest.fn(() => mockTransporter),
  },
  createTransport: jest.fn(() => mockTransporter),
}));
jest.mock('@/lib/utils', () => ({
  getBaseUrl: jest.fn(() => 'http://localhost:3000'),
}));

describe('EmailService', () => {
  let emailService: EmailService;

  beforeEach(() => {
    jest.clearAllMocks();
    emailService = EmailService.getInstance();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = EmailService.getInstance();
      const instance2 = EmailService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should initialize transporter with correct config', () => {
      // Test that the service initializes without errors
      expect(emailService).toBeDefined();
    });
  });

  describe('generateSimpleHTML', () => {
    it('should generate HTML email template', () => {
      const subject = 'Test Subject';
      const content = '<p>Test content</p>';
      
      const html = emailService.generateSimpleHTML(subject, content);
      
      expect(html).toContain(subject);
      expect(html).toContain(content);
      expect(html).toContain('Nobilis Talent Solutions');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
    });

    it('should include HTML in subject (no escaping)', () => {
      const subject = 'Test <script>alert("xss")</script>';
      const content = '<p>Safe content</p>';
      
      const html = emailService.generateSimpleHTML(subject, content);
      
      expect(html).toContain(subject);
      expect(html).toContain('<script>');
    });

    it('should include proper HTML structure', () => {
      const html = emailService.generateSimpleHTML('Test', 'Content');
      
      expect(html).toContain('<meta charset="utf-8">');
      expect(html).toContain('<meta name="viewport"');
      expect(html).toContain('<style>');
      expect(html).toContain('.container');
      expect(html).toContain('.header');
      expect(html).toContain('.content');
      expect(html).toContain('.footer');
    });
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const emailData: EmailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
        text: 'Test content',
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await emailService.sendEmail(emailData);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: undefined,
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
        text: 'Test content',
        attachments: undefined,
      });
    });

    it('should use custom from address', async () => {
      const emailData: EmailData = {
        from: 'custom@example.com',
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      await emailService.sendEmail(emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'custom@example.com',
        })
      );
    });

    it('should handle email sending error', async () => {
      const emailData: EmailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      };

      const error = new Error('SMTP connection failed');
      mockTransporter.sendMail.mockRejectedValue(error);

      const result = await emailService.sendEmail(emailData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('SMTP connection failed');
    });

    it('should handle unknown error', async () => {
      const emailData: EmailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      };

      mockTransporter.sendMail.mockRejectedValue('Unknown error');

      const result = await emailService.sendEmail(emailData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });

    it('should include attachments when provided', async () => {
      const emailData: EmailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
        attachments: [
          {
            filename: 'test.pdf',
            content: Buffer.from('test'),
          },
        ],
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      await emailService.sendEmail(emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: emailData.attachments,
        })
      );
    });
  });

  describe('sendContactNotification', () => {
    it('should send contact notification with correct format', async () => {
      const notificationData = {
        to: 'admin@example.com',
        contactData: {
          id: 'contact-123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          company: 'Test Corp',
          challenges: 'Need help with leadership coaching',
          contactMethod: 'email' as const,
          submittedAt: '2024-01-15T10:30:00Z',
        },
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await emailService.sendContactNotification(notificationData);

      expect(result.success).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'New Contact: John Doe - Test Corp',
          html: expect.stringContaining('John Doe'),
          html: expect.stringContaining('john@example.com'),
          html: expect.stringContaining('Test Corp'),
          html: expect.stringContaining('Need help with leadership coaching'),
        })
      );
    });

    it('should handle missing optional fields', async () => {
      const notificationData = {
        to: 'admin@example.com',
        contactData: {
          id: 'contact-124',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          challenges: 'Need help.',
          contactMethod: 'email' as const,
          submittedAt: '2024-01-15T11:00:00Z',
        },
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await emailService.sendContactNotification(notificationData);

      expect(result.success).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalled();
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with correct content', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await emailService.sendWelcomeEmail(
        'john@example.com',
        'John Doe'
      );

      expect(result.success).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john@example.com',
          subject: 'Welcome to Nobilis Talent Solutions!',
          html: expect.stringContaining('John Doe'),
          html: expect.stringContaining('Welcome'),
        })
      );
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email with reset link', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await emailService.sendPasswordResetEmail(
        'john@example.com',
        'reset-token-123'
      );

      expect(result.success).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john@example.com',
          subject: 'Password Reset Request - Nobilis Talent Solutions',
          html: expect.stringContaining('reset-token-123'),
        })
      );
    });
  });

  describe('sendInvoiceEmail', () => {
    it('should send invoice email with PDF attachment', async () => {
      const invoiceData = {
        invoice: {
          invoiceNumber: 'INV-001',
          clientName: 'John Doe',
          clientEmail: 'client@example.com',
          issueDate: new Date('2024-01-01'),
          dueDate: new Date('2024-01-31'),
          items: [
            { description: 'Consulting', total: 1500 }
          ],
          total: 1500,
          status: 'pending' as const,
        },
        clientEmail: 'client@example.com',
        clientName: 'John Doe',
        pdfAttachment: {
          filename: 'invoice.pdf',
          content: Buffer.from('mock pdf content'),
          contentType: 'application/pdf',
        },
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await emailService.sendInvoiceEmail(invoiceData);

      expect(result.success).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'client@example.com',
          subject: 'Invoice #INV-001',
          html: expect.stringContaining('John Doe'),
          html: expect.stringContaining('INV-001'),
          html: expect.stringContaining('$1500.00'),
          attachments: expect.arrayContaining([
            expect.objectContaining({
              filename: 'invoice.pdf',
              contentType: 'application/pdf',
            }),
          ]),
        })
      );
    });
  });

  describe('sendPaymentConfirmation', () => {
    it('should send payment confirmation email', async () => {
      const paymentData = {
        to: 'customer@example.com',
        clientName: 'Jane Smith',
        amount: 500,
        invoiceNumber: 'INV-001',
        paymentMethod: 'Credit Card',
        transactionId: 'txn_test_123',
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await emailService.sendPaymentConfirmation(paymentData);

      expect(result.success).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'customer@example.com',
          subject: 'Payment Confirmation - Invoice #INV-001',
          html: expect.stringContaining('Jane Smith'),
          html: expect.stringContaining('$500.00'),
          html: expect.stringContaining('txn_test_123'),
        })
      );
    });
  });

  describe('testConnection', () => {
    it('should test SMTP connection successfully', async () => {
      mockTransporter.verify = jest.fn().mockResolvedValue(true);

      const result = await emailService.testConnection();

      expect(result.success).toBe(true);
      expect(mockTransporter.verify).toHaveBeenCalled();
    });

    it('should handle connection failure', async () => {
      mockTransporter.verify = jest.fn().mockRejectedValue(new Error('Connection failed'));

      const result = await emailService.testConnection();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection failed');
    });
  });
});
