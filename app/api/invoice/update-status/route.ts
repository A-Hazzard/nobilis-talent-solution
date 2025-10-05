import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/helpers/auth';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, getDoc, serverTimestamp, FieldValue } from 'firebase/firestore';
import { ServerAuditLogger } from '@/lib/helpers/auditLogger';

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin privileges
    const authResult = await getAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { invoiceId, status } = await request.json();

    if (!invoiceId || !status) {
      return NextResponse.json(
        { error: 'Invoice ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Status transition validation
    const isValidStatusTransition = (currentStatus: string, newStatus: string): boolean => {
      switch (currentStatus) {
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
    };

    // Get current invoice to check if it exists
    const invoiceRef = doc(db, 'invoices', invoiceId);
    const invoiceSnapshot = await getDoc(invoiceRef);

    if (!invoiceSnapshot.exists()) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const currentInvoice = invoiceSnapshot.data();
    const previousStatus = currentInvoice?.status;

    // Validate status transition
    if (!isValidStatusTransition(previousStatus, status)) {
      if (previousStatus === 'paid') {
        return NextResponse.json({ error: 'Cannot change status of paid invoices' }, { status: 400 });
      } else if (previousStatus === 'cancelled') {
        return NextResponse.json({ error: 'Cannot change status of cancelled invoices' }, { status: 400 });
      } else if (previousStatus === 'overdue' && !['paid', 'cancelled'].includes(status)) {
        return NextResponse.json({ error: 'Overdue invoices can only be marked as paid or cancelled' }, { status: 400 });
      } else {
        return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 });
      }
    }
    
    const updateData: Record<string, FieldValue | string> = {
      status,
      updatedAt: serverTimestamp()
    };

    // Add specific timestamps based on status
    if (status === 'sent' && currentInvoice?.status !== 'sent') {
      updateData.sentAt = serverTimestamp();
    }
    if (status === 'paid' && currentInvoice?.status !== 'paid') {
      updateData.paidAt = serverTimestamp();
    }

    // Update the invoice
    await updateDoc(invoiceRef, updateData);

    // Log audit action with enhanced details
    const auditLogger = ServerAuditLogger.getInstance();
    await auditLogger.logPaymentStatusUpdate(request, { id: authResult.user.uid, email: authResult.user.email }, {
      id: invoiceId,
      type: 'invoice',
      clientName: currentInvoice?.clientName || '',
      clientEmail: currentInvoice?.clientEmail || '',
      previousStatus: previousStatus || 'unknown',
      newStatus: status,
      amount: currentInvoice?.total || 0,
    });

    return NextResponse.json({
      success: true,
      message: `Invoice status updated to ${status}`
    });

  } catch (error) {
    console.error('Error updating invoice status:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice status' },
      { status: 500 }
    );
  }
}