import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export async function GET(_request: NextRequest) {
  try {
    const q = query(collection(db, 'pendingPayments'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const payments = snapshot.docs.map((docSnap) => {
      const data: any = docSnap.data();
      return {
        id: docSnap.id,
        type: 'pending-payment',
        clientEmail: data.clientEmail || '',
        clientName: data.clientName || '',
        baseAmount: typeof data.baseAmount === 'number' ? data.baseAmount : Number(data.baseAmount || 0),
        bonusAmount: typeof data.bonusAmount === 'number' ? data.bonusAmount : Number(data.bonusAmount || 0),
        totalAmount: typeof data.totalAmount === 'number' ? data.totalAmount : Number(data.totalAmount || 0),
        description: data.description || '',
        status: data.status || 'pending',
        invoiceNumber: data.invoiceNumber || undefined,
        stripeSessionId: data.stripeSessionId || undefined,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || undefined,
        expiresAt: data.expiresAt?.toDate?.()?.toISOString() || undefined,
        notes: data.notes || undefined,
        // Calculate total if not present
        calculatedTotal: (typeof data.baseAmount === 'number' ? data.baseAmount : Number(data.baseAmount || 0)) + 
                        (typeof data.bonusAmount === 'number' ? data.bonusAmount : Number(data.bonusAmount || 0))
      };
    });
    
    console.log('🔍 Admin Payments API: Fetched payments with bonus amounts:', 
      payments.map(p => ({ 
        id: p.id, 
        status: p.status, 
        baseAmount: p.baseAmount, 
        bonusAmount: p.bonusAmount, 
        totalAmount: p.totalAmount,
        calculatedTotal: p.calculatedTotal
      }))
    );
    
    return NextResponse.json({ payments });
  } catch (error) {
    console.error('❌ Admin Payments API: Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}