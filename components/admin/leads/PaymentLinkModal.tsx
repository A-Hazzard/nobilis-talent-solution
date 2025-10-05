'use client'

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { PaymentLinkService } from '@/lib/services/PaymentLinkService';
import type { PendingPaymentResponse } from '@/shared/types/payment';
import type { PaymentLinkModalProps } from '@/lib/types/components';

export function PaymentLinkModal({ isOpen, onOpenChange, lead }: PaymentLinkModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<PendingPaymentResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    setIsLoading(true);
    setError('');
    setSuccess(null);

    try {
      const paymentData = {
        clientName: `${lead.firstName} ${lead.lastName}`,
        clientEmail: lead.email,
        baseAmount: parseFloat(amount),
        description: description || `Leadership consultation for ${lead.firstName} ${lead.lastName}`,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
      };

      // Create pending payment
      const response = await fetch('/api/payment/create-pending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create pending payment');
      }

      const result = await response.json();
      setSuccess(result);
      
      // Reset form
      setAmount('');
      setDescription('');
      setDueDate(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment link');
    } finally {
      setIsLoading(false);
    }
  };



  const handleClose = () => {
    onOpenChange(false);
    setSuccess(null);
    setError('');
    setAmount('');
    setDescription('');
    setDueDate(undefined);
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Create Pending Payment for {lead.firstName} {lead.lastName}
        </DialogTitle>
        </DialogHeader>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={`${lead.firstName} ${lead.lastName}`}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientEmail">Client Email</Label>
              <Input
                id="clientEmail"
                value={lead.email}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={`Leadership consultation for ${lead.firstName} ${lead.lastName}`}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <DatePicker
                date={dueDate}
                onDateChange={setDueDate}
                placeholder="Select due date"
                disabledDates={(date) => date < new Date()}
              />
              <p className="text-xs text-muted-foreground">
                If not specified, defaults to 30 days from invoice date
              </p>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !amount}
                className="flex-1"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  'Generate Link'
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Pending Payment Created!</span>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Client Information</Label>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2 font-medium">{success.pendingPayment.clientName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2 font-medium">{success.pendingPayment.clientEmail}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="ml-2 font-semibold">{PaymentLinkService.formatAmount(success.pendingPayment.baseAmount)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Description:</span>
                    <span className="ml-2">{success.pendingPayment.description}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Payment ID:</span>
                  <span className="ml-2 font-mono text-xs">{success.id}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                {lead.firstName} will now see a "Pay" tab when they log in. They can complete their payment of {PaymentLinkService.formatAmount(success.pendingPayment.baseAmount)} and optionally add more if they want to be generous.
              </p>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 