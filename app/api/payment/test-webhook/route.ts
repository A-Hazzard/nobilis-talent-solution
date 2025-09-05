import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';

/**
 * Test endpoint to manually trigger webhook logic and test Firebase document updates
 * This helps debug why payment status isn't being updated
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pendingPaymentId, testAmount = 75, testBaseAmount = 50 } = body;

    if (!pendingPaymentId) {
      return NextResponse.json(
        { error: 'pendingPaymentId is required' },
        { status: 400 }
      );
    }

    console.log('🧪 Test Webhook: Starting test with params:', {
      pendingPaymentId,
      testAmount,
      testBaseAmount
    });

    // Test 1: Check if pending payment exists
    console.log('🧪 Test Webhook: Checking if pending payment exists...');
    const ref = doc(db, 'pendingPayments', pendingPaymentId);
    const docSnap = await getDoc(ref);
    
    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'Pending payment not found', pendingPaymentId },
        { status: 404 }
      );
    }

    const pendingPayment = docSnap.data();
    console.log('🧪 Test Webhook: Found pending payment:', pendingPayment);

    // Test 2: Simulate webhook document update
    console.log('🧪 Test Webhook: Simulating webhook document update...');
    
    const bonusAmount = Math.max(0, testAmount - testBaseAmount);
    
    const updateData = {
      status: 'completed',
      stripeSessionId: `test_session_${Date.now()}`,
      updatedAt: serverTimestamp(),
      bonusAmount: bonusAmount,
      totalAmount: testAmount,
      // Preserve existing fields
      baseAmount: pendingPayment.baseAmount || testBaseAmount,
      description: pendingPayment.description,
      clientName: pendingPayment.clientName,
      clientEmail: pendingPayment.clientEmail,
      notes: pendingPayment.notes
    };

    console.log('🧪 Test Webhook: Update data:', updateData);
    
    await updateDoc(ref, updateData);
    console.log('✅ Test Webhook: Document updated successfully');

    // Test 3: Verify the update
    console.log('🧪 Test Webhook: Verifying the update...');
    const updatedDoc = await getDoc(ref);
    if (updatedDoc.exists()) {
      const updatedData = updatedDoc.data();
      console.log('🧪 Test Webhook: Updated document data:', updatedData);
      
      return NextResponse.json({
        success: true,
        message: 'Webhook test completed successfully',
        testResults: {
          pendingPaymentFound: true,
          documentUpdated: true,
          updateData: updateData,
          finalDocumentData: updatedData
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Document not found after update',
        testResults: {
          pendingPaymentFound: true,
          documentUpdated: false
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Test Webhook: Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Webhook test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check a specific pending payment
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pendingPaymentId = searchParams.get('id');

    if (!pendingPaymentId) {
      return NextResponse.json(
        { error: 'id parameter is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Test Webhook: Checking pending payment:', pendingPaymentId);

    const ref = doc(db, 'pendingPayments', pendingPaymentId);
    const docSnap = await getDoc(ref);
    
    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'Pending payment not found', pendingPaymentId },
        { status: 404 }
      );
    }

    const pendingPayment = docSnap.data();
    console.log('🔍 Test Webhook: Pending payment data:', pendingPayment);

    return NextResponse.json({
      success: true,
      message: 'Pending payment found',
      pendingPayment: {
        id: pendingPaymentId,
        ...pendingPayment,
        createdAt: pendingPayment.createdAt?.toDate?.()?.toISOString(),
        updatedAt: pendingPayment.updatedAt?.toDate?.()?.toISOString(),
        expiresAt: pendingPayment.expiresAt?.toDate?.()?.toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Test Webhook: Error checking pending payment:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check pending payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

