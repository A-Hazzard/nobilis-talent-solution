import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/helpers/auth';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, serverTimestamp, FieldValue } from 'firebase/firestore';
import { EmailService } from '@/lib/services/EmailService';
import { logAuditAction } from '@/lib/utils/auditUtils';

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

    // Parse FormData to get PDF file and other data
    const formData = await request.formData();
    const invoiceId = formData.get('invoiceId') as string;
    const message = formData.get('message') as string;
    const pdfFile = formData.get('pdf') as File;

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    if (!pdfFile) {
      return NextResponse.json(
        { error: 'PDF file is required' },
        { status: 400 }
      );
    }

    // Get invoice from database
    const invoiceRef = doc(db, 'invoices', invoiceId);
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

    // Convert File to Buffer for email attachment
    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());

    // Send email with invoice
    const emailService = EmailService.getInstance();
    const emailResult = await emailService.sendInvoiceEmail({
      invoice,
      clientEmail: invoice.clientEmail,
      clientName: invoice.clientName,
      customMessage: message,
      pdfAttachment: {
        filename: `invoice-${invoice.invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    // Update invoice status to 'sent' if it was 'draft'
    const updateData: Record<string, FieldValue | string> = {
      updatedAt: serverTimestamp()
    };

    if (invoiceData.status === 'draft') {
      updateData.status = 'sent';
      updateData.sentAt = serverTimestamp();
    }

    await updateDoc(invoiceRef, updateData);

    // Log audit action
    await logAuditAction({
      action: 'update',
      entity: 'resource',
      entityId: invoiceId,
      timestamp: Date.now(),
      details: {
        title: `Invoice emailed to client`,
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        action: 'email_sent',
        hasCustomMessage: !!message
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Invoice sent successfully'
    });

  } catch (error) {
    console.error('Error sending invoice email:', error);
    return NextResponse.json(
      { error: 'Failed to send invoice email' },
      { status: 500 }
    );
  }
}