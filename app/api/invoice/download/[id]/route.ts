import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/helpers/auth';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { PDFService } from '@/lib/services/PDFService';
import { logAuditAction } from '@/lib/utils/auditUtils';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // Get invoice from database
    const invoiceRef = doc(db, 'invoices', id);
    const invoiceSnapshot = await getDoc(invoiceRef);

    if (!invoiceSnapshot.exists()) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const invoiceData = invoiceSnapshot.data();

    // Convert Firestore data to InvoicePreview format
    const invoice = {
      invoiceNumber: invoiceData.invoiceNumber,
      clientName: invoiceData.clientName,
      clientEmail: invoiceData.clientEmail,
      items: invoiceData.items || [],
      subtotal: invoiceData.subtotal || 0,
      taxAmount: invoiceData.taxAmount || invoiceData.tax || 0,
      total: invoiceData.total || 0,
      dueDate: invoiceData.dueDate?.toDate?.() || new Date()
    };

    // Generate PDF using PDFService
    const pdfService = PDFService.getInstance();
    const pdfResult = await pdfService.generateInvoicePDF(invoice, invoice.invoiceNumber);
    
    if (!pdfResult.success || !pdfResult.data) {
      return NextResponse.json(
        { error: pdfResult.error || 'Failed to generate PDF' },
        { status: 500 }
      );
    }

    // Log audit action
    await logAuditAction({
      action: 'update',
      entity: 'resource',
      entityId: id,
      timestamp: Date.now(),
      details: {
        title: `Invoice downloaded`,
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        action: 'download'
      }
    });

    // Return HTML as response (placeholder until PDF generation is implemented)
    return new NextResponse(pdfResult.data, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="invoice-${invoice.invoiceNumber}.html"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Error downloading invoice:', error);
    return NextResponse.json(
      { error: 'Failed to download invoice' },
      { status: 500 }
    );
  }
}