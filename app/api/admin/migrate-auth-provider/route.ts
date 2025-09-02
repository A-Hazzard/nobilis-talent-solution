import { NextRequest, NextResponse } from 'next/server';
import { migrateAuthProvider } from '@/lib/utils/migrateAuthProvider';
import { getAuth } from '@/lib/helpers/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await getAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Run the migration
    const result = await migrateAuthProvider();

    return NextResponse.json({
      success: true,
      message: 'Auth provider migration completed successfully',
      result
    });

  } catch (error) {
    console.error('Migration API error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
