import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';
import type { CalendlyConfig } from '@/shared/types/entities';

// Get Firebase Admin Firestore
const db = getAdminFirestore();

/**
 * GET /api/calendly/booking-url
 * Get the current active Calendly booking URL (public endpoint)
 */
export async function GET(_request: NextRequest) {
  try {
    // Get the current Calendly config (there should only be one)
    const configRef = db.collection('calendly-config').doc('main');
    const configDoc = await configRef.get();

    if (!configDoc.exists) {
      return NextResponse.json({
        data: null,
        message: 'No Calendly configuration found'
      });
    }

    const configData = configDoc.data() as CalendlyConfig;
    
    // Only return the URL if it's active
    if (!configData.isActive) {
      return NextResponse.json({
        data: null,
        message: 'Calendly booking is currently disabled'
      });
    }

    return NextResponse.json({
      data: {
        bookingUrl: configData.bookingUrl,
        isActive: configData.isActive,
      }
    });

  } catch (error) {
    console.error('Error fetching Calendly booking URL:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Calendly booking URL' },
      { status: 500 }
    );
  }
}
