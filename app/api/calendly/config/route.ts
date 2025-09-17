import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { getAuth, isAdmin } from '@/lib/helpers/auth';
import type { CalendlyConfig } from '@/shared/types/entities';

// Get Firebase Admin Firestore
const db = getAdminFirestore();

/**
 * GET /api/calendly/config
 * Get the current Calendly configuration
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const authResult = await getAuth(request);
    if (!authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isUserAdmin = await isAdmin(request);
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

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
    
      return NextResponse.json({
        data: {
          ...configData,
          id: configDoc.id,
          createdAt: configData.createdAt instanceof Date ? configData.createdAt : new Date(configData.createdAt),
          updatedAt: configData.updatedAt instanceof Date ? configData.updatedAt : new Date(configData.updatedAt),
        }
      });

  } catch (error) {
    console.error('Error fetching Calendly config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Calendly configuration' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calendly/config
 * Create or update the Calendly configuration
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const authResult = await getAuth(request);
    if (!authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isUserAdmin = await isAdmin(request);
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { bookingUrl, isActive = true } = body;

    // Validate input
    if (!bookingUrl || typeof bookingUrl !== 'string') {
      return NextResponse.json(
        { error: 'Valid booking URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(bookingUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Check if it's a Calendly URL
    if (!bookingUrl.includes('calendly.com')) {
      return NextResponse.json(
        { error: 'URL must be a valid Calendly booking link' },
        { status: 400 }
      );
    }

    const now = new Date();
    const configData: Omit<CalendlyConfig, 'id'> = {
      bookingUrl,
      isActive: Boolean(isActive),
      createdAt: now,
      updatedAt: now,
      createdBy: authResult.user.uid,
    };

    // Update or create the config (there should only be one)
    const configRef = db.collection('calendly-config').doc('main');
    await configRef.set(configData, { merge: true });

    return NextResponse.json({
      data: {
        id: 'main',
        ...configData,
      },
      message: 'Calendly configuration updated successfully'
    });

  } catch (error) {
    console.error('Error updating Calendly config:', error);
    return NextResponse.json(
      { error: 'Failed to update Calendly configuration' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/calendly/config
 * Delete the Calendly configuration
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const authResult = await getAuth(request);
    if (!authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isUserAdmin = await isAdmin(request);
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Delete the config
    const configRef = db.collection('calendly-config').doc('main');
    await configRef.delete();

    return NextResponse.json({
      message: 'Calendly configuration deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting Calendly config:', error);
    return NextResponse.json(
      { error: 'Failed to delete Calendly configuration' },
      { status: 500 }
    );
  }
}
