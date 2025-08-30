import { PaymentService } from '@/lib/services/PaymentService';
import { PaymentOption, PaymentSession } from '@/shared/types/payment';

// Mock fetch globally
global.fetch = jest.fn();

describe('PaymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('should create checkout session successfully', async () => {
      const mockResponse = { sessionId: 'cs_test_123' };
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await PaymentService.createCheckoutSession('consultation');

      expect(fetch).toHaveBeenCalledWith('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ optionId: 'consultation' }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle API error response', async () => {
      const mockError = { error: 'Invalid payment option' };
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(mockError),
      });

      await expect(PaymentService.createCheckoutSession('invalid')).rejects.toThrow(
        'Invalid payment option'
      );
    });

    it('should handle network error', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      });

      await expect(PaymentService.createCheckoutSession('consultation')).rejects.toThrow(
        'Failed to create checkout session'
      );
    });

    it('should handle fetch rejection', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(PaymentService.createCheckoutSession('consultation')).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('verifySession', () => {
    it('should verify session successfully', async () => {
      const mockPaymentSession: PaymentSession = {
        id: 'cs_test_123',
        status: 'complete',
        amount: 15000,
        currency: 'usd',
        customerEmail: 'test@example.com',
        paymentIntentId: 'pi_test_123',
        metadata: {
          optionId: 'consultation',
          customerName: 'John Doe',
        },
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPaymentSession),
      });

      const result = await PaymentService.verifySession('cs_test_123');

      expect(fetch).toHaveBeenCalledWith('/api/payment/verify-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: 'cs_test_123' }),
      });
      expect(result).toEqual(mockPaymentSession);
    });

    it('should handle verification error', async () => {
      const mockError = { error: 'Session not found' };
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(mockError),
      });

      await expect(PaymentService.verifySession('invalid_session')).rejects.toThrow(
        'Session not found'
      );
    });

    it('should handle generic verification error', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      });

      await expect(PaymentService.verifySession('cs_test_123')).rejects.toThrow(
        'Failed to verify session'
      );
    });
  });

  describe('getPaymentOptions', () => {
    it('should return all payment options', () => {
      const options = PaymentService.getPaymentOptions();

      expect(options).toHaveLength(3);
      expect(options).toEqual([
        {
          id: 'consultation',
          title: 'Leadership Consultation',
          description: 'One-on-one leadership coaching session',
          price: 150,
          duration: '60 minutes',
          features: [
            'Personalized leadership assessment',
            'Goal setting and action planning',
            'Follow-up resources and materials',
            '30-day email support'
          ]
        },
        {
          id: 'workshop',
          title: 'Team Workshop',
          description: 'Group leadership development workshop',
          price: 500,
          duration: 'Half-day session',
          features: [
            'Interactive team exercises',
            'Leadership skill development',
            'Team dynamics analysis',
            'Custom workshop materials',
            'Post-workshop assessment'
          ]
        },
        {
          id: 'retreat',
          title: 'Leadership Retreat',
          description: 'Comprehensive leadership development program',
          price: 2500,
          duration: '2-day intensive',
          features: [
            'Comprehensive leadership assessment',
            'Strategic planning session',
            'Team building activities',
            'Personal development plan',
            '3-month follow-up support',
            'All materials and resources included'
          ]
        }
      ]);
    });

    it('should return options with correct data types', () => {
      const options = PaymentService.getPaymentOptions();

      options.forEach(option => {
        expect(typeof option.id).toBe('string');
        expect(typeof option.title).toBe('string');
        expect(typeof option.description).toBe('string');
        expect(typeof option.price).toBe('number');
        expect(typeof option.duration).toBe('string');
        expect(Array.isArray(option.features)).toBe(true);
        expect(option.features.length).toBeGreaterThan(0);
      });
    });

    it('should return consultation option with correct details', () => {
      const options = PaymentService.getPaymentOptions();
      const consultation = options.find(option => option.id === 'consultation');

      expect(consultation).toBeDefined();
      expect(consultation?.price).toBe(150);
      expect(consultation?.duration).toBe('60 minutes');
      expect(consultation?.features).toHaveLength(4);
    });

    it('should return workshop option with correct details', () => {
      const options = PaymentService.getPaymentOptions();
      const workshop = options.find(option => option.id === 'workshop');

      expect(workshop).toBeDefined();
      expect(workshop?.price).toBe(500);
      expect(workshop?.duration).toBe('Half-day session');
      expect(workshop?.features).toHaveLength(5);
    });

    it('should return retreat option with correct details', () => {
      const options = PaymentService.getPaymentOptions();
      const retreat = options.find(option => option.id === 'retreat');

      expect(retreat).toBeDefined();
      expect(retreat?.price).toBe(2500);
      expect(retreat?.duration).toBe('2-day intensive');
      expect(retreat?.features).toHaveLength(6);
    });
  });

  describe('formatPrice', () => {
    it('should format price in USD currency', () => {
      expect(PaymentService.formatPrice(150)).toBe('$150.00');
      expect(PaymentService.formatPrice(500)).toBe('$500.00');
      expect(PaymentService.formatPrice(2500)).toBe('$2,500.00');
    });

    it('should handle decimal values', () => {
      expect(PaymentService.formatPrice(99.99)).toBe('$99.99');
      expect(PaymentService.formatPrice(149.50)).toBe('$149.50');
    });

    it('should handle zero and negative values', () => {
      expect(PaymentService.formatPrice(0)).toBe('$0.00');
      expect(PaymentService.formatPrice(-100)).toBe('-$100.00');
    });

    it('should handle large numbers', () => {
      expect(PaymentService.formatPrice(10000)).toBe('$10,000.00');
      expect(PaymentService.formatPrice(999999.99)).toBe('$999,999.99');
    });

    it('should handle very small decimal values', () => {
      expect(PaymentService.formatPrice(0.01)).toBe('$0.01');
      expect(PaymentService.formatPrice(0.99)).toBe('$0.99');
    });
  });
});
