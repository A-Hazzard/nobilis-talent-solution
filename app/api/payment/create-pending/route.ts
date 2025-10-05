import { NextRequest, NextResponse } from 'next/server';
import { CreatePendingPaymentRequest, PendingPaymentResponse } from '@/shared/types/payment';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { EmailService } from '@/lib/services/EmailService';
import type { InvoicePreview } from '@/shared/types/payment';

export async function POST(request: NextRequest) {
  try {
    const body: CreatePendingPaymentRequest = await request.json();
    const { clientEmail, clientName, baseAmount, description, dueDate } = body;

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

    // Create pending payment object (no expiration for Firebase-based auth)
    const pendingPaymentData = {
      clientEmail,
      clientName,
      baseAmount,
      description,
      status: 'pending' as const,
      createdAt: new Date(),
      // Removed expiresAt - payments don't expire in Firebase-based system
    };

    // Store the pending payment in Firebase
    const adminDb = getAdminFirestore();
    const docRef = await adminDb.collection('pendingPayments').add(pendingPaymentData);
    const paymentId = docRef.id;

    const pendingPayment = {
      id: paymentId,
      ...pendingPaymentData,
    };

    const response: PendingPaymentResponse = {
      id: paymentId,
      pendingPayment,
    };

    // Attempt to send an invoice email to the client (non-blocking)
    try {
      const invoiceNumber = `INV-${paymentId.slice(0, 6).toUpperCase()}`;
      const invoice: InvoicePreview = {
        invoiceNumber,
        clientName,
        clientEmail,
        items: [
          {
            id: '1',
            description,
            quantity: 1,
            unitPrice: baseAmount,
            total: baseAmount,
            type: 'service',
          },
        ],
        subtotal: baseAmount,
        taxAmount: 0,
        total: baseAmount,
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      // Save invoice number to the payment
      await docRef.update({ invoiceNumber, updatedAt: new Date() });

      const emailService = EmailService.getInstance();

      // Send email notification without PDF (admin will send PDF manually from dashboard)
      await emailService.sendInvoiceEmail({
        invoice,
        clientEmail,
        clientName,
        customMessage: 'You have a new invoice. Please check your dashboard to view and pay.',
        // No PDF attachment - admin will send manually from dashboard
      });
    } catch (e) {
      console.error('Invoice email send failed (non-blocking):', e);
    }

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
    const adminDb = getAdminFirestore();
    const querySnapshot = await adminDb
      .collection('pendingPayments')
      .where('clientEmail', '==', email)
      .where('status', '==', 'pending')
      .get();
    
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

    // Removed expiration check - payments don't expire in Firebase-based system

    return NextResponse.json({ pendingPayment });
  } catch (error) {
    console.error('Error retrieving pending payment:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve pending payment' },
      { status: 500 }
    );
  }
} 