import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

export async function PUT(request: NextRequest) {
  try {
    // TODO: Add admin authentication check here
    // For now, we'll allow access to this endpoint
    
    const { paymentId, baseAmount, description, notes } = await request.json();
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }
    
    if (baseAmount !== undefined && (typeof baseAmount !== 'number' || baseAmount < 0)) {
      return NextResponse.json(
        { error: 'Base amount must be a non-negative number' },
        { status: 400 }
      );
    }
    
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    if (baseAmount !== undefined) {
      updateData.baseAmount = baseAmount;
    }
    
    if (description !== undefined) {
      updateData.description = description;
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    
    const paymentRef = doc(db, 'pendingPayments', paymentId);
    await updateDoc(paymentRef, updateData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Payment updated successfully' 
    });
    
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
} 