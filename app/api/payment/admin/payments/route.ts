import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export async function GET(_request: NextRequest) {
  try {
    // TODO: Add admin authentication check here
    // For now, we'll allow access to this endpoint
    
    const paymentsRef = collection(db, 'pendingPayments');
    const q = query(paymentsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const payments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      expiresAt: doc.data().expiresAt?.toDate?.() || doc.data().expiresAt,
    }));
    
    return NextResponse.json({ 
      success: true, 
      payments 
    });
    
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
} 