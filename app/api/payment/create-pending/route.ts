import { NextRequest, NextResponse } from 'next/server';
import { CreatePendingPaymentRequest, PendingPaymentResponse } from '@/shared/types/payment';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body: CreatePendingPaymentRequest = await request.json();
    const { clientEmail, clientName, baseAmount, description, expiresInDays = 30 } = body;

    // Validate input
    if (!clientEmail || !clientName || !baseAmount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: clientEmail, clientName, baseAmount, description' },
        { status: 400 }
      );
    }

    if (baseAmount <= 0) {
      return NextResponse.json(
        { error: 'Base amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Create pending payment object
    const pendingPaymentData = {
      clientEmail,
      clientName,
      baseAmount,
      description,
      status: 'pending' as const,
      createdAt: new Date(),
      expiresAt,
    };

    // Store the pending payment in Firebase
    const docRef = await addDoc(collection(db, 'pendingPayments'), pendingPaymentData);
    const paymentId = docRef.id;

    const pendingPayment = {
      id: paymentId,
      ...pendingPaymentData,
    };

    const response: PendingPaymentResponse = {
      id: paymentId,
      pendingPayment,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating pending payment:', error);
    return NextResponse.json(
      { error: 'Failed to create pending payment' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve pending payment by email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Find pending payment for this email in Firebase
    const q = query(
      collection(db, 'pendingPayments'),
      where('clientEmail', '==', email),
      where('status', '==', 'pending')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'No pending payment found for this email' },
        { status: 404 }
      );
    }

    // Get the first pending payment (should only be one per email)
    const docSnapshot = querySnapshot.docs[0];
    const paymentData = docSnapshot.data();
    const pendingPayment = {
      id: docSnapshot.id,
      ...paymentData,
    };

    // Check if payment has expired
    if (paymentData.expiresAt && new Date() > new Date(paymentData.expiresAt.toDate())) {
      // Update status to expired
      await updateDoc(docSnapshot.ref, { status: 'expired' });
      return NextResponse.json(
        { error: 'Payment has expired' },
        { status: 410 }
      );
    }

    return NextResponse.json({ pendingPayment });
  } catch (error) {
    console.error('Error retrieving pending payment:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve pending payment' },
      { status: 500 }
    );
  }
} 