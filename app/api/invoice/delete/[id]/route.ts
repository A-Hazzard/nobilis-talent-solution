import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/helpers/auth';
import { db } from '@/lib/firebase/config';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';
import { ServerAuditLogger } from '@/lib/helpers/auditLogger';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication and admin privileges
    const authResult = await getAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // Get invoice data before deletion for audit logging
    const invoiceRef = doc(db, 'invoices', id);
    const invoiceSnapshot = await getDoc(invoiceRef);

    if (!invoiceSnapshot.exists()) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const invoiceData = invoiceSnapshot.data();

    // Delete the invoice
    await deleteDoc(invoiceRef);

    // Log audit action with enhanced details
    const auditLogger = ServerAuditLogger.getInstance();
    await auditLogger.logInvoiceDeletion(request, { id: authResult.user.uid, email: authResult.user.email }, {
      id,
      invoiceNumber: invoiceData.invoiceNumber,
      clientName: invoiceData.clientName,
      clientEmail: invoiceData.clientEmail,
      total: invoiceData.total,
      status: invoiceData.status,
    });

    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
