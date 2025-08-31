import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { EmailService } from '@/lib/services/EmailService';
import { PDFService } from '@/lib/services/PDFService';
import { getAuth } from '@/lib/helpers/auth';
import { ServerAuditLogger } from '@/lib/helpers/auditLogger';

export async function PUT(request: NextRequest) {
  try {
    // Check authentication and admin privileges
    const authResult = await getAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { paymentId, status } = await request.json();
    if (!paymentId || !status) {
      return NextResponse.json({ error: 'paymentId and status are required' }, { status: 400 });
    }
    if (!['pending', 'completed', 'cancelled', 'overdue'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const paymentRef = doc(db, 'pendingPayments', paymentId);
    const snap = await getDoc(paymentRef);
    if (!snap.exists()) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    const current = snap.data() as any;
    const previousStatus = current.status;

    await updateDoc(paymentRef, { status, updatedAt: serverTimestamp() });

    // Log audit action with enhanced details
    const auditLogger = ServerAuditLogger.getInstance();
    await auditLogger.logPaymentStatusUpdate(request, { id: authResult.user.uid, email: authResult.user.email }, {
      id: paymentId,
      type: 'pending-payment',
      clientName: current.clientName || '',
      clientEmail: current.clientEmail || '',
      previousStatus,
      newStatus: status,
      amount: (current.baseAmount || 0) + (current.bonusAmount || 0),
    });

    // Send notification email on cancellation or completion
    try {
      const emailService = EmailService.getInstance();
      if (status === 'cancelled') {
        const content = `
          <p>Dear ${current.clientName || 'Valued Client'},</p>
          
          <p>We wanted to inform you that your payment request${current.invoiceNumber ? ` for invoice <strong>#${current.invoiceNumber}</strong>` : ''} has been cancelled.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h4>Payment Details:</h4>
            <p><strong>Amount:</strong> $${Number(current.baseAmount || 0).toFixed(2)}</p>
            <p><strong>Description:</strong> ${current.description || 'Leadership Consultation'}</p>
            <p><strong>Status:</strong> <span style="color: #dc3545; font-weight: bold;">Cancelled</span></p>
          </div>
          
          <p>If this cancellation was unexpected or if you have any questions, please don't hesitate to contact us immediately.</p>
          
          <p>You can always create a new payment request when you're ready to proceed.</p>
          
          <p>Best regards,<br>
          Nobilis Talent Solutions Team</p>
        `;
        
        const html = emailService.generateSimpleHTML("Payment Cancelled", content);
        
        await emailService.sendEmail({ 
          to: current.clientEmail, 
          subject: `Payment Cancelled - ${current.invoiceNumber ? `Invoice #${current.invoiceNumber}` : 'Leadership Consultation'}`, 
          html 
        });
      } else if (status === 'completed') {
        const baseAmount = Number(current.baseAmount || 0);
        const totalAmount = Number(current.totalAmount || current.baseAmount || 0);
        const bonusAmount = totalAmount - baseAmount;
        const invoiceNumber = current.invoiceNumber || `INV-${paymentId.slice(0, 6).toUpperCase()}`;
        
        console.log('🔍 Admin Update: Starting completion email process for payment:', {
          paymentId,
          invoiceNumber,
          clientEmail: current.clientEmail,
          clientName: current.clientName,
          baseAmount,
          totalAmount,
          bonusAmount
        });
        
        // Generate PDF invoice with proper amounts (including bonus if applicable)
        let pdfAttachment = undefined;
        try {
          // Create items array with base service and bonus if applicable
          const items = [{
            id: '1',
            description: current.description || 'Leadership Consultation',
            quantity: 1,
            unitPrice: baseAmount,
            total: baseAmount,
            type: 'service' as const
          }];
          
          // Add bonus item if there's a bonus amount
          if (bonusAmount > 0) {
            items.push({
              id: '2',
              description: 'Additional Payment (Bonus)',
              quantity: 1,
              unitPrice: bonusAmount,
              total: bonusAmount,
              type: 'service' as const
            });
          }
          
          const invoiceData = {
            invoiceNumber,
            clientName: current.clientName,
            clientEmail: current.clientEmail,
            items,
            subtotal: totalAmount,
            taxAmount: 0,
            total: totalAmount,
            dueDate: new Date()
          };
          
          console.log('📄 Admin Update: Generating PDF for completion email...');
          const pdfService = PDFService.getInstance();
          const pdf = await pdfService.generateInvoicePDF(invoiceData, invoiceNumber);
          
          if (pdf.success && pdf.data) {
            pdfAttachment = {
              filename: `invoice-${invoiceNumber}.pdf`,
              content: pdf.data,
              contentType: 'application/pdf'
            };
            console.log('✅ Admin Update: PDF generated successfully, size:', pdf.data.length, 'bytes');
          } else {
            console.log('❌ Admin Update: PDF generation failed:', pdf.error);
          }
        } catch (pdfError) {
          console.error('❌ Admin Update: PDF generation error:', pdfError);
        }
        
        // Send payment confirmation email with PDF attachment (same pattern as webhook)
        console.log('📧 Admin Update: Sending payment confirmation email with PDF...');
        const emailResult = await emailService.sendPaymentConfirmationWithPDF({
          to: current.clientEmail,
          clientName: current.clientName || current.clientEmail,
          invoiceNumber,
          amount: totalAmount, // Use total amount (including bonus)
          paymentMethod: 'manual', // Since this is manually marked as completed
          transactionId: `MANUAL-${paymentId}`,
          pdfAttachment
        });
        
        console.log('📧 Admin Update: Email result:', emailResult);
      } else if (status === 'overdue') {
        const content = `
          <p>Dear ${current.clientName || 'Valued Client'},</p>
          
          <p>We wanted to inform you that your payment request is now overdue.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h4>Payment Details:</h4>
            <p><strong>Amount:</strong> $${Number(current.baseAmount || 0).toFixed(2)}</p>
            <p><strong>Description:</strong> ${current.description || 'Leadership Consultation'}</p>
            ${current.invoiceNumber ? `<p><strong>Invoice Number:</strong> #${current.invoiceNumber}</p>` : ''}
            <p><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">Overdue</span></p>
          </div>
          
          <p>Please contact us at your earliest convenience to arrange payment or discuss alternative arrangements.</p>
          
          <p>Best regards,<br>
          Nobilis Talent Solutions Team</p>
        `;
        
        const html = emailService.generateSimpleHTML("Payment Overdue", content);
        
        await emailService.sendEmail({ 
          to: current.clientEmail, 
          subject: `Payment Overdue - ${current.invoiceNumber ? `Invoice #${current.invoiceNumber}` : 'Leadership Consultation'}`, 
          html 
        });
      }
    } catch (e) {
      console.error('Failed to send status email:', e);
    }
    return NextResponse.json({ success: true, message: `Payment status updated to ${status}` });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 });
  }
}