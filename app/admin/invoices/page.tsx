'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveTable, ResponsiveText, ResponsiveSecondaryText } from '@/components/ui/responsive-table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Eye, 
  MoreHorizontal,
  FileText,
  CheckCircle,
  XCircle,
  RefreshCw,
  CreditCard,
  Clock,
  Trash2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { generateInvoicePdf } from '@/lib/helpers/generateInvoicePdf';

type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

type PendingPayment = {
  id: string;
  type: 'pending-payment';
  clientEmail: string;
  clientName: string;
  baseAmount: number;
  bonusAmount?: number;
  description: string;
  status: PaymentStatus;
  createdAt: string;
};

type Invoice = {
  id: string;
  type: 'invoice';
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  total: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
};

type Payment = PendingPayment | Invoice;

type PaymentFilters = {
  status: string;
  type: string;
  dateRange: string;
  search: string;
};

export default function InvoicesPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [filters, setFilters] = useState<PaymentFilters>({
    status: 'all',
    type: 'all',
    dateRange: 'all',
    search: ''
  });

  // Load payments
  useEffect(() => {
    loadPayments();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [payments, filters]);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payment/admin/payments', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      } else {
        toast.error('Failed to load payments');
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(payment => {
        const normalizedStatus = normalizeStatus(payment.status, payment.type);
        return normalizedStatus === filters.status;
      });
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(payment => payment.type === filters.type);
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(payment => {
        if (payment.type === 'pending-payment') {
          return payment.clientName.toLowerCase().includes(searchTerm) ||
                 payment.clientEmail.toLowerCase().includes(searchTerm) ||
                 payment.description.toLowerCase().includes(searchTerm);
        } else {
          return payment.clientName.toLowerCase().includes(searchTerm) ||
                 payment.clientEmail.toLowerCase().includes(searchTerm) ||
                 payment.invoiceNumber.toLowerCase().includes(searchTerm);
        }
      });
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      if (filters.dateRange !== 'all') {
        filtered = filtered.filter(payment => new Date(payment.createdAt) >= filterDate);
      }
    }

    setFilteredPayments(filtered);
  };

  // Status transition validation
  const isValidStatusTransition = (currentStatus: string, newStatus: string, paymentType: 'pending-payment' | 'invoice'): boolean => {
    const normalizedCurrent = normalizeStatus(currentStatus, paymentType);
    
    if (paymentType === 'pending-payment') {
      switch (normalizedCurrent) {
        case 'paid':
          return false; // Paid payments cannot be changed
        case 'cancelled':
          return false; // Cancelled payments cannot be changed
        case 'overdue':
          return newStatus === 'paid' || newStatus === 'cancelled'; // Overdue can only go to paid or cancelled
        case 'pending':
          return ['paid', 'overdue', 'cancelled'].includes(newStatus); // Pending can go to any status
        default:
          return true;
      }
    } else {
      switch (normalizedCurrent) {
        case 'paid':
          return false; // Paid invoices cannot be changed
        case 'cancelled':
          return false; // Cancelled invoices cannot be changed
        case 'overdue':
          return newStatus === 'paid' || newStatus === 'cancelled'; // Overdue can only go to paid or cancelled
        case 'draft':
        case 'sent':
          return ['sent', 'paid', 'overdue', 'cancelled'].includes(newStatus); // Draft/sent can go to other statuses
        default:
          return true;
      }
    }
  };

  const handleStatusUpdate = async (payment: Payment, newStatus: PaymentStatus | InvoiceStatus) => {
    try {
      // Validate status transition
      if (!isValidStatusTransition(payment.status, newStatus, payment.type)) {
        const currentNormalized = normalizeStatus(payment.status, payment.type);
        if (currentNormalized === 'paid') {
          toast.error('Cannot change status of paid items');
        } else if (currentNormalized === 'cancelled') {
          toast.error('Cannot change status of cancelled items');
        } else if (currentNormalized === 'overdue') {
          toast.error('Overdue items can only be marked as paid or cancelled');
        } else {
          toast.error('Invalid status transition');
        }
        return;
      }
      if (payment.type === 'pending-payment') {
        // Map UI statuses to backend statuses for pending payments
        const backendStatus = ((): 'pending' | 'completed' | 'cancelled' | 'overdue' => {
          switch (newStatus) {
            case 'paid':
              return 'completed';
            case 'cancelled':
              return 'cancelled';
            case 'overdue':
              return 'overdue';
            case 'pending':
            default:
              return 'pending';
          }
        })();

        const response = await fetch('/api/payment/admin/update-status', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ paymentId: payment.id, status: backendStatus })
        });

        if (!response.ok) {
          toast.error('Failed to update payment status');
          return;
        }
      } else if (payment.type === 'invoice') {
        // Handle invoice status updates
        const response = await fetch('/api/invoice/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ invoiceId: payment.id, status: newStatus })
        });

        if (!response.ok) {
          toast.error('Failed to update invoice status');
          return;
        }
      }

      // Audit logging is now handled server-side in the API endpoints

      toast.success(`Status updated to ${newStatus}`);
      
      // Refresh data to show updated status
      await loadPayments();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const handleDownload = async (payment: Invoice) => {
    try {
      // Generate PDF on frontend
      const pdfBlob = await generateInvoicePdf({
        invoiceNumber: payment.invoiceNumber,
        clientName: payment.clientName,
        clientEmail: payment.clientEmail,
        issueDate: payment.issueDate,
        dueDate: payment.dueDate,
        items: payment.items,
        subtotal: payment.items.reduce((sum, item) => sum + item.total, 0),
        total: payment.total,
      });

      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${payment.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Invoice downloaded');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const handleDeleteInvoice = async (payment: Invoice) => {
    if (!confirm(`Are you sure you want to delete invoice ${payment.invoiceNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/invoice/delete/${payment.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        // Audit logging is now handled server-side in the API endpoint
        
        toast.success('Invoice deleted successfully');
        
        // Refresh data to show updated list
        await loadPayments();
      } else {
        toast.error('Failed to delete invoice');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    }
  };

  const handleSendEmail = async () => {
    if (!selectedPayment || selectedPayment.type !== 'invoice') return;

    try {
      const invoice = selectedPayment as Invoice;
      
      // Generate PDF on frontend
      const pdfBlob = await generateInvoicePdf({
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        items: invoice.items,
        subtotal: invoice.items.reduce((sum, item) => sum + item.total, 0),
        total: invoice.total,
        notes: emailMessage,
      });

      // Create FormData with PDF
      const formData = new FormData();
      formData.append('pdf', pdfBlob, `invoice-${invoice.invoiceNumber}.pdf`);
      formData.append('invoiceId', invoice.id);
      formData.append('message', emailMessage || '');

      const response = await fetch('/api/invoice/send-email', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        toast.success('Invoice sent successfully');
        setIsEmailModalOpen(false);
        setEmailMessage('');
        setSelectedPayment(null);
        
        // Refresh data to show updated status
        await loadPayments();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send invoice');
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
    }
  };

  const normalizeStatus = (status: string, type: 'pending-payment' | 'invoice'): string => {
    // Normalize status values to handle case variations and edge cases
    const normalized = status?.toLowerCase()?.trim();
    
    if (type === 'pending-payment') {
      // Map common variations to expected values
      const statusMap: Record<string, PaymentStatus> = {
        'pending': 'pending',
        'paid': 'paid',
        'expired': 'overdue', // Map expired to overdue
        'overdue': 'overdue',
        'cancelled': 'cancelled',
        'canceled': 'cancelled', // Handle American spelling
        'complete': 'paid',
        'completed': 'paid',
        'success': 'paid',
        'failed': 'cancelled',
        'error': 'cancelled'
      };
      
      return statusMap[normalized] || 'pending';
    } else {
      // Map common variations to expected values
      const statusMap: Record<string, InvoiceStatus> = {
        'draft': 'draft',
        'sent': 'sent',
        'paid': 'paid',
        'overdue': 'overdue',
        'cancelled': 'cancelled',
        'canceled': 'cancelled', // Handle American spelling
        'complete': 'paid',
        'completed': 'paid',
        'success': 'paid',
        'failed': 'cancelled',
        'error': 'cancelled'
      };
      
      return statusMap[normalized] || 'draft';
    }
  };

  const getStatusBadge = (payment: Payment) => {
    // Normalize the status
    const normalizedStatus = normalizeStatus(payment.status, payment.type);
    
    if (payment.type === 'pending-payment') {
      const statusConfig = {
        pending: { variant: 'default' as const, icon: Clock, text: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
        paid: { variant: 'default' as const, icon: CheckCircle, text: 'Paid', className: 'bg-green-100 text-green-800' },
        overdue: { variant: 'destructive' as const, icon: XCircle, text: 'Overdue', className: '' },
        cancelled: { variant: 'secondary' as const, icon: XCircle, text: 'Cancelled', className: '' }
      };

      const config = statusConfig[normalizedStatus as PaymentStatus] || statusConfig.pending; // Fallback to pending
      const Icon = config.icon;

      return (
        <Badge variant={config.variant} className={config.className}>
          <Icon className="w-3 h-3 mr-1" />
          {config.text}
        </Badge>
      );
    } else {
      const statusConfig = {
        draft: { variant: 'secondary' as const, icon: FileText, text: 'Draft', className: '' },
        sent: { variant: 'default' as const, icon: Mail, text: 'Sent', className: '' },
        paid: { variant: 'default' as const, icon: CheckCircle, text: 'Paid', className: 'bg-green-100 text-green-800' },
        overdue: { variant: 'destructive' as const, icon: XCircle, text: 'Overdue', className: '' },
        cancelled: { variant: 'secondary' as const, icon: XCircle, text: 'Cancelled', className: '' }
      };

      const config = statusConfig[normalizedStatus as InvoiceStatus] || statusConfig.draft; // Fallback to draft
      const Icon = config.icon;

      return (
        <Badge variant={config.variant} className={config.className}>
          <Icon className="w-3 h-3 mr-1" />
          {config.text}
        </Badge>
      );
    }
  };

  const formatCurrency = (amount: number) => {
    const num = Number(amount || 0);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getPaymentAmount = (payment: Payment) => {
    if (payment.type === 'pending-payment') {
      return payment.baseAmount + (payment.bonusAmount || 0);
    } else {
      return payment.total;
    }
  };

  const getPaymentIdentifier = (payment: Payment) => {
    if (payment.type === 'pending-payment') {
      return `Payment-${payment.id.slice(-6)}`;
    } else {
      return payment.invoiceNumber;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
        <p className="text-muted-foreground">
          Manage and track all payments, invoices, and client billing.
        </p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search payments..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pending-payment">Payment Links</SelectItem>
                <SelectItem value="invoice">Invoices</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range Filter */}
            <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh Button */}
            <Button variant="outline" onClick={loadPayments} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payments ({filteredPayments.length})</CardTitle>
          <CardDescription>
            Manage payment links and invoices, update statuses, and track payments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading payments...</span>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-500">No payments match your current filters.</p>
            </div>
          ) : (
            <ResponsiveTable
              data={filteredPayments}
              columns={[
                {
                  key: 'type',
                  label: 'Type',
                  render: (payment: Payment) => (
                    <div className="flex items-center gap-2">
                      {payment.type === 'pending-payment' ? (
                        <CreditCard className="w-4 h-4 text-blue-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-sm font-medium">
                        {payment.type === 'pending-payment' ? 'Payment Link' : 'Invoice'}
                      </span>
                    </div>
                  ),
                  mobileRender: (payment: Payment) => (
                    <div className="flex items-center gap-2">
                      {payment.type === 'pending-payment' ? (
                        <CreditCard className="w-4 h-4 text-blue-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-green-500" />
                      )}
                      <ResponsiveText className="font-medium">
                        {payment.type === 'pending-payment' ? 'Payment Link' : 'Invoice'}
                      </ResponsiveText>
                    </div>
                  ),
                },
                {
                  key: 'identifier',
                  label: 'ID/Number',
                  render: (payment: Payment) => (
                    <span className="font-medium">{getPaymentIdentifier(payment)}</span>
                  ),
                  mobileRender: (payment: Payment) => (
                    <ResponsiveText className="font-medium">{getPaymentIdentifier(payment)}</ResponsiveText>
                  ),
                },
                {
                  key: 'client',
                  label: 'Client',
                  render: (payment: Payment) => (
                    <div>
                      <div className="font-medium">{payment.clientName}</div>
                      <div className="text-sm text-gray-500">{payment.clientEmail}</div>
                    </div>
                  ),
                  mobileRender: (payment: Payment) => (
                    <div className="space-y-1">
                      <ResponsiveText className="font-medium">{payment.clientName}</ResponsiveText>
                      <ResponsiveSecondaryText>{payment.clientEmail}</ResponsiveSecondaryText>
                    </div>
                  ),
                },
                {
                  key: 'amount',
                  label: 'Amount',
                  render: (payment: Payment) => formatCurrency(getPaymentAmount(payment)),
                  mobileRender: (payment: Payment) => (
                    <ResponsiveText className="font-semibold">{formatCurrency(getPaymentAmount(payment))}</ResponsiveText>
                  ),
                },
                {
                  key: 'status',
                  label: 'Status',
                  render: (payment: Payment) => getStatusBadge(payment),
                  mobileRender: (payment: Payment) => getStatusBadge(payment),
                },
                {
                  key: 'created',
                  label: 'Created',
                  render: (payment: Payment) => formatDate(payment.createdAt),
                  mobileRender: (payment: Payment) => (
                    <ResponsiveSecondaryText>{formatDate(payment.createdAt)}</ResponsiveSecondaryText>
                  ),
                  hideOnMobile: true,
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (payment: Payment) => (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedPayment(payment);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {payment.type === 'invoice' && (
                          <DropdownMenuItem onClick={() => handleDownload(payment as Invoice)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                        )}
                        {payment.type === 'invoice' && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPayment(payment);
                              setIsEmailModalOpen(true);
                            }}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                        )}
                        <Separator className="my-1" />
                        {payment.type === 'pending-payment' && isValidStatusTransition(payment.status, 'paid', payment.type) && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(payment, 'paid')}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Paid
                          </DropdownMenuItem>
                        )}
                        {payment.type === 'pending-payment' && isValidStatusTransition(payment.status, 'overdue', payment.type) && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(payment, 'overdue')}
                            className="text-red-600"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Mark as Overdue
                          </DropdownMenuItem>
                        )}
                        {payment.type === 'pending-payment' && isValidStatusTransition(payment.status, 'cancelled', payment.type) && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(payment, 'cancelled')}
                            className="text-red-600"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Payment
                          </DropdownMenuItem>
                        )}
                        {payment.type === 'invoice' && isValidStatusTransition(payment.status, 'paid', payment.type) && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(payment, 'paid')}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Paid
                          </DropdownMenuItem>
                        )}
                        {payment.type === 'invoice' && isValidStatusTransition(payment.status, 'overdue', payment.type) && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(payment, 'overdue')}
                            className="text-red-600"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Mark as Overdue
                          </DropdownMenuItem>
                        )}
                        {payment.type === 'invoice' && isValidStatusTransition(payment.status, 'cancelled', payment.type) && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(payment, 'cancelled')}
                            className="text-red-600"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Invoice
                          </DropdownMenuItem>
                        )}
                        {payment.type === 'invoice' && (
                          <DropdownMenuItem
                            onClick={() => handleDeleteInvoice(payment as Invoice)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Invoice
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ),
                  mobileRender: (payment: Payment) => (
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPayment(payment);
                          setIsViewModalOpen(true);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {payment.type === 'invoice' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(payment as Invoice);
                          }}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                      )}
                      {payment.type === 'pending-payment' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(payment, 'paid');
                          }}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Paid
                        </Button>
                      )}
                    </div>
                  ),
                },
              ]}
              title={`Payments (${filteredPayments.length})`}
              className="space-y-4"
            />
          )}
        </CardContent>
      </Card>

      {/* View Payment Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              View detailed information for {selectedPayment?.type === 'pending-payment' ? 'payment link' : 'invoice'}
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm font-medium">
                    {selectedPayment.type === 'pending-payment' ? 'Payment Link' : 'Invoice'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedPayment)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Client</Label>
                  <p className="text-sm">{selectedPayment.clientName}</p>
                  <p className="text-sm text-gray-500">{selectedPayment.clientEmail}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-lg font-bold">{formatCurrency(getPaymentAmount(selectedPayment))}</p>
                  {selectedPayment.type === 'pending-payment' && selectedPayment.bonusAmount && selectedPayment.bonusAmount > 0 && (
                    <p className="text-sm text-green-600">
                      Base: {formatCurrency(selectedPayment.baseAmount)} + Bonus: {formatCurrency(selectedPayment.bonusAmount)}
                    </p>
                  )}
                </div>
              </div>

              {selectedPayment.type === 'pending-payment' && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm">{selectedPayment.description}</p>
                </div>
              )}

              {selectedPayment.type === 'invoice' && (
                <div>
                  <Label className="text-sm font-medium">Items</Label>
                  <div className="mt-2 space-y-2">
                    {selectedPayment.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatCurrency(item.unitPrice)}</p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.total)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm">{formatDate(selectedPayment.createdAt)}</p>
                </div>
                {selectedPayment.type === 'invoice' && (
                  <div>
                    <Label className="text-sm font-medium">Due Date</Label>
                    <p className="text-sm">{formatDate(selectedPayment.dueDate)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Email Modal (only for invoices) */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Invoice Email</DialogTitle>
            <DialogDescription>
              Send invoice {selectedPayment?.type === 'invoice' ? (selectedPayment as Invoice).invoiceNumber : ''} to {selectedPayment?.clientEmail}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-message">Message (Optional)</Label>
              <Textarea
                id="email-message"
                placeholder="Add a personal message to include with the invoice..."
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEmailModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail}>
                <Mail className="w-4 h-4 mr-2" />
                Send Invoice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}