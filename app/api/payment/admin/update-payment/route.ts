import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { EmailService } from '@/lib/services/EmailService';

export async function PUT(request: NextRequest) {
  try {
    const { paymentId, baseAmount, description, notes } = await request.json();
    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    if (baseAmount !== undefined && (typeof baseAmount !== 'number' || baseAmount < 0)) {
      return NextResponse.json({ error: 'Base amount must be a non-negative number' }, { status: 400 });
    }

    const paymentRef = doc(db, 'pendingPayments', paymentId);

    // Load current payment to compare and to get recipient info
    const snap = await getDoc(paymentRef);
    if (!snap.exists()) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    const current = snap.data() as any;

    const updateData: Record<string, any> = { updatedAt: serverTimestamp() };
    if (baseAmount !== undefined) updateData.baseAmount = baseAmount;
    if (description !== undefined) updateData.description = description;
    if (notes !== undefined) updateData.notes = notes;

    await updateDoc(paymentRef, updateData);

    // If amount or description changed, email the client
    try {
      const emailService = EmailService.getInstance();
      const amountChanged = baseAmount !== undefined && Number(current.baseAmount) !== Number(baseAmount);
      const descChanged = description !== undefined && current.description !== description;
      if (amountChanged || descChanged) {
        const newAmount = baseAmount !== undefined ? baseAmount : Number(current.baseAmount || 0);
        const subject = amountChanged ? 'Your payment amount was updated' : 'Your payment details were updated';
        const content = `
          <p>Hi ${current.clientName || ''},</p>
          <p>We updated your payment request${current.invoiceNumber ? ` for invoice <strong>${current.invoiceNumber}</strong>` : ''}.</p>
          ${amountChanged ? `<p><strong>New Amount:</strong> $${newAmount.toFixed(2)}</p>` : ''}
          ${descChanged ? `<p><strong>Description:</strong> ${description}</p>` : ''}
          <p>If you have any questions, reply to this email.</p>
        `;
        await emailService.sendEmail({ to: current.clientEmail, subject, html: content });
      }
    } catch (e) {
      console.error('Failed to send update email:', e);
    }

    return NextResponse.json({ success: true, message: 'Payment updated successfully' });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}