import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/helpers/auth';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, orderBy, where, limit as firestoreLimit } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin privileges
    const authResult = await getAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limitParam = searchParams.get('limit');
    const pageParam = searchParams.get('page');

    // Build query
    let invoiceQuery = query(
      collection(db, 'invoices'),
      orderBy('createdAt', 'desc')
    );

    // Add status filter if provided
    if (status && status !== 'all') {
      invoiceQuery = query(
        collection(db, 'invoices'),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    }

    // Add pagination if provided
    const limitNum = limitParam ? parseInt(limitParam) : 50;
    if (limitNum > 0) {
      invoiceQuery = query(invoiceQuery, firestoreLimit(limitNum));
    }

    // Execute query
    const querySnapshot = await getDocs(invoiceQuery);
    const invoices = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamps to ISO strings for JSON serialization
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      issueDate: doc.data().issueDate?.toDate?.()?.toISOString() || new Date().toISOString(),
      dueDate: doc.data().dueDate?.toDate?.()?.toISOString() || new Date().toISOString(),
      sentAt: doc.data().sentAt?.toDate?.()?.toISOString() || null,
      paidAt: doc.data().paidAt?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json({
      invoices,
      total: invoices.length,
      page: pageParam ? parseInt(pageParam) : 1,
      limit: limitNum
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}