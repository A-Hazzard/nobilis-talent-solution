import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { EmailService } from '@/lib/services/EmailService';

export async function PUT(request: NextRequest) {
  try {
    const { paymentId, status } = await request.json();
    if (!paymentId || !status) {
      return NextResponse.json({ error: 'paymentId and status are required' }, { status: 400 });
    }
    if (!['pending', 'completed', 'cancelled', 'expired'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const paymentRef = doc(db, 'pendingPayments', paymentId);
    const snap = await getDoc(paymentRef);
    if (!snap.exists()) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    const current = snap.data() as any;

    await updateDoc(paymentRef, { status, updatedAt: serverTimestamp() });

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
        const amountNum = Number(current.baseAmount || 0);
        const content = `
          <p>Dear ${current.clientName || 'Valued Client'},</p>
          
          <p>Great news! Your payment has been successfully marked as completed.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h4>Payment Confirmation:</h4>
            <p><strong>Amount:</strong> $${amountNum.toFixed(2)}</p>
            <p><strong>Description:</strong> ${current.description || 'Leadership Consultation'}</p>
            ${current.invoiceNumber ? `<p><strong>Invoice Number:</strong> #${current.invoiceNumber}</p>` : ''}
            <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">Completed</span></p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>Thank you for choosing Nobilis Talent Solutions. We appreciate your business and look forward to working with you!</p>
          
          <p>If you have any questions about this payment or need to schedule your consultation, please don't hesitate to reach out.</p>
          
          <p>Best regards,<br>
          Nobilis Talent Solutions Team</p>
        `;
        
        const html = emailService.generateSimpleHTML("Payment Completed", content);
        
        await emailService.sendEmail({ 
          to: current.clientEmail, 
          subject: `Payment Completed - ${current.invoiceNumber ? `Invoice #${current.invoiceNumber}` : 'Leadership Consultation'}`, 
          html 
        });
      } else if (status === 'expired') {
        const content = `
          <p>Dear ${current.clientName || 'Valued Client'},</p>
          
          <p>We wanted to inform you that your payment request has expired.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4>Payment Details:</h4>
            <p><strong>Amount:</strong> $${Number(current.baseAmount || 0).toFixed(2)}</p>
            <p><strong>Description:</strong> ${current.description || 'Leadership Consultation'}</p>
            ${current.invoiceNumber ? `<p><strong>Invoice Number:</strong> #${current.invoiceNumber}</p>` : ''}
            <p><strong>Status:</strong> <span style="color: #ffc107; font-weight: bold;">Expired</span></p>
          </div>
          
          <p>If you'd like to proceed with your consultation, you can create a new payment request at any time.</p>
          
          <p>Best regards,<br>
          Nobilis Talent Solutions Team</p>
        `;
        
        const html = emailService.generateSimpleHTML("Payment Expired", content);
        
        await emailService.sendEmail({ 
          to: current.clientEmail, 
          subject: `Payment Expired - ${current.invoiceNumber ? `Invoice #${current.invoiceNumber}` : 'Leadership Consultation'}`, 
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