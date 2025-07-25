import { NextRequest, NextResponse } from 'next/server';
import { ResourcesService } from '@/lib/services/ResourcesService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }

    const resourcesService = new ResourcesService();
    const response = await resourcesService.incrementDownloadCount(id);

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error incrementing download count:', error);
    return NextResponse.json(
      { error: 'Failed to increment download count' },
      { status: 500 }
    );
  }
} 