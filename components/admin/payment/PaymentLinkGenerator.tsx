'use client'

import { useState } from 'react';
import { Copy, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { PaymentLinkService } from '@/lib/services/PaymentLinkService';
import type { CreatePaymentLinkRequest, PaymentLinkResponse } from '@/shared/types/payment';

export default function PaymentLinkGenerator() {
  const [formData, setFormData] = useState<CreatePaymentLinkRequest>({
    clientName: '',
    clientEmail: '',
    amount: 0,
    description: '',
    expiresInDays: 30,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<PaymentLinkResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(null);

    try {
      // Validate form data
      const errors = PaymentLinkService.validatePaymentLinkData(formData);
      if (errors.length > 0) {
        setError(errors.join(', '));
        return;
      }

      // Generate payment link
      const result = await PaymentLinkService.createPaymentLink(formData);
      setSuccess(result);
      
      // Reset form
      setFormData({
        clientName: '',
        clientEmail: '',
        amount: 0,
        description: '',
        expiresInDays: 30,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment link');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const openPaymentLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Generate Payment Link</h2>
        <p className="text-muted-foreground">
          Create a custom payment link for a specific client with a specific amount.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-foreground mb-2">
              Client Name *
            </label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter client name"
              required
            />
          </div>

          <div>
            <label htmlFor="clientEmail" className="block text-sm font-medium text-foreground mb-2">
              Client Email *
            </label>
            <input
              type="email"
              id="clientEmail"
              name="clientEmail"
              value={formData.clientEmail}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="client@example.com"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">
              Amount (USD) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-muted-foreground">$</span>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount || ''}
                onChange={handleInputChange}
                className="w-full pl-8 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="expiresInDays" className="block text-sm font-medium text-foreground mb-2">
              Expires In (Days)
            </label>
            <input
              type="number"
              id="expiresInDays"
              name="expiresInDays"
              value={formData.expiresInDays || 30}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="30"
              min="1"
              max="365"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Describe the service or consultation being provided..."
            required
          />
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <span className="text-destructive">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Generating Payment Link...</span>
            </div>
          ) : (
            'Generate Payment Link'
          )}
        </button>
      </form>

      {success && (
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Payment Link Created!</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Payment Link
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={success.paymentUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-sm"
                />
                <button
                  onClick={() => copyToClipboard(success.paymentUrl)}
                  className="p-2 text-muted-foreground hover:text-primary transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => openPaymentLink(success.paymentUrl)}
                  className="p-2 text-muted-foreground hover:text-primary transition-colors"
                  title="Open payment link"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Link ID:</span>
                <span className="ml-2 font-mono">{success.id}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Amount:</span>
                <span className="ml-2 font-semibold">{PaymentLinkService.formatAmount(formData.amount)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Share this link with your client. They can use any major credit card to complete the payment securely through Stripe.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 