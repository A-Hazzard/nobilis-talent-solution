import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

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
    await updateDoc(paymentRef, { status, updatedAt: serverTimestamp() });
    return NextResponse.json({ success: true, message: `Payment status updated to ${status}` });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 });
  }
}