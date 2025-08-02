'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Download, 
  Mail, 
  FileText, 
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  X,
  CreditCard
} from 'lucide-react';
import type { InvoicePreview } from '@/shared/types/payment';
import { InvoiceService } from '@/lib/services/InvoiceService';

interface InvoicePreviewModalProps {
  invoice: InvoicePreview | null;
  isOpen: boolean;
  onClose: () => void;
  onProceedToPayment: () => void;
}

export default function InvoicePreviewModal({
  invoice,
  isOpen,
  onClose,
  onProceedToPayment
}: InvoicePreviewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [actionStatus, setActionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleDownload = async () => {
    if (!invoice) return;
    
    setIsDownloading(true);
    setActionStatus('idle');
    setErrorMessage('');

    try {
      // TODO: Implement actual PDF generation
      // For now, create a simple text file
      const content = `
INVOICE

Invoice Number: ${invoice.invoiceNumber}
Date: ${InvoiceService.formatDate(invoice.dueDate)}
Due Date: ${InvoiceService.formatDate(invoice.dueDate)}

Bill To:
${invoice.clientName}
${invoice.clientEmail}

Items:
${invoice.items.map(item => 
  `${item.description} - Qty: ${item.quantity} x ${InvoiceService.formatCurrency(item.unitPrice)} = ${InvoiceService.formatCurrency(item.total)}`
).join('\n')}

Subtotal: ${InvoiceService.formatCurrency(invoice.subtotal)}
Tax: ${InvoiceService.formatCurrency(invoice.taxAmount)}
Total: ${InvoiceService.formatCurrency(invoice.total)}
      `;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setActionStatus('success');
      setTimeout(() => setActionStatus('idle'), 3000);
    } catch {
      setActionStatus('error');
      setErrorMessage('Failed to download invoice');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!invoice) return;
    
    setIsSending(true);
    setActionStatus('idle');
    setErrorMessage('');

    try {
      // TODO: Implement actual email sending
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      setActionStatus('success');
      setTimeout(() => setActionStatus('idle'), 3000);
    } catch {
      setActionStatus('error');
      setErrorMessage('Failed to send invoice email');
    } finally {
      setIsSending(false);
    }
  };

  if (!invoice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center text-white">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-gray-900">Invoice Preview</div>
              <div className="text-sm font-normal text-gray-600">{invoice.invoiceNumber}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Success/Error Messages */}
          {actionStatus === 'success' && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">Action completed successfully!</span>
                </div>
              </CardContent>
            </Card>
          )}

          {actionStatus === 'error' && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800 font-medium">{errorMessage}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoice Header */}
          <Card className="border-2 border-gray-100">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill To:</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{invoice.clientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{invoice.clientEmail}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details:</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">Invoice: {invoice.invoiceNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">Due: {InvoiceService.formatDate(invoice.dueDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card className="border-2 border-gray-100">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Items:</h3>
              <div className="space-y-4">
                {invoice.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.description}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity} × {InvoiceService.formatCurrency(item.unitPrice)}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{InvoiceService.formatCurrency(item.total)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Invoice Summary */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-medium">{InvoiceService.formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Tax (8%):</span>
                  <span className="font-medium">{InvoiceService.formatCurrency(invoice.taxAmount)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-primary">{InvoiceService.formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={onProceedToPayment}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white py-4 text-lg rounded-xl"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Proceed to Payment
            </Button>
            
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              variant="outline"
              className="py-4 text-lg rounded-xl"
            >
              {isDownloading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Downloading...
                </div>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
            
            <Button
              onClick={handleSendEmail}
              disabled={isSending}
              variant="outline"
              className="py-4 text-lg rounded-xl"
            >
              {isSending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Sending...
                </div>
              ) : (
                <>
                  <Mail className="w-5 h-5 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>

          {/* Additional Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            
            <div className="text-sm text-gray-500">
              Need help? Contact us at support@nobilis.com
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 