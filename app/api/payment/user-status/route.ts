import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';

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

    // Get all payments for this user and process in memory to avoid complex indexes
    const db = getAdminFirestore();
    const allPaymentsSnapshot = await db.collection('pendingPayments')
      .where('clientEmail', '==', email)
      .get();
    
    let pendingPayment = null;
    let hasPendingPayment = false;
    let hasCompletedPayment = false;
    let latestPendingTimestamp = 0;
    
    // Process all payments to find the latest pending and check for completed
    allPaymentsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const status = data.status;
      const createdAt = data.createdAt?.toDate?.() || new Date(0);
      const timestamp = createdAt.getTime();
      
      if (status === 'pending') {
        // Keep track of the most recent pending payment
        if (timestamp > latestPendingTimestamp) {
          latestPendingTimestamp = timestamp;
          hasPendingPayment = true;
          pendingPayment = {
            id: doc.id,
            ...data,
          };
        }
      } else if (status === 'completed' || status === 'paid') {
        hasCompletedPayment = true;
      }
    });

    // Check invoices collection for pending invoices (simple query)
    const invoiceSnapshot = await db.collection('invoices')
      .where('clientEmail', '==', email)
      .where('status', '==', 'pending')
      .get();
    
    let hasLatestInvoicePending = false;
    let latestInvoice = null;
    let latestInvoiceTimestamp = 0;
    
    // Process invoices to find the most recent pending
    invoiceSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate?.() || new Date(0);
      const timestamp = createdAt.getTime();
      
      if (timestamp > latestInvoiceTimestamp) {
        latestInvoiceTimestamp = timestamp;
        hasLatestInvoicePending = true;
        latestInvoice = {
          id: doc.id,
          ...data,
        };
      }
    });

    // Show payment button if:
    // 1. There's a pending payment in pendingPayments collection, OR
    // 2. The latest invoice status is pending
    const shouldShowPaymentButton = hasPendingPayment || hasLatestInvoicePending;

    return NextResponse.json({
      hasPendingPayment,
      hasCompletedPayment,
      pendingPayment,
      hasLatestInvoicePending,
      latestInvoice,
      shouldShowPaymentButton
    });

  } catch (error) {
    console.error('Error checking user payment status:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}
