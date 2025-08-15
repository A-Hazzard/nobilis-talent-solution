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
          <p>Hi ${current.clientName || ''},</p>
          <p>Your payment request${current.invoiceNumber ? ` for invoice <strong>${current.invoiceNumber}</strong>` : ''} has been cancelled. If this is unexpected, please contact us.</p>
        `;
        await emailService.sendEmail({ to: current.clientEmail, subject: 'Payment cancelled', html: content });
      } else if (status === 'completed') {
        const amountNum = Number(current.baseAmount || 0);
        const content = `
          <p>Hi ${current.clientName || ''},</p>
          <p>Thank you. We marked your payment as completed${current.invoiceNumber ? ` for invoice <strong>${current.invoiceNumber}</strong>` : ''}.</p>
          <p><strong>Amount:</strong> $${amountNum.toFixed(2)}</p>
        `;
        await emailService.sendEmail({ to: current.clientEmail, subject: 'Payment completed', html: content });
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