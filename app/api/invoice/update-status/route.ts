import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/helpers/auth';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, getDoc, serverTimestamp, FieldValue } from 'firebase/firestore';
import { logAuditAction } from '@/lib/utils/auditUtils';

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

    // Log audit action
    await logAuditAction({
      action: 'update',
      entity: 'resource',
      entityId: invoiceId,
      timestamp: Date.now(),
      details: {
        title: `Invoice status updated`,
        previousStatus: currentInvoice?.status,
        newStatus: status,
        invoiceNumber: currentInvoice?.invoiceNumber,
        clientName: currentInvoice?.clientName
      }
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