import { NextRequest, NextResponse } from 'next/server';
import { ResourcesService } from '@/lib/services/ResourcesService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resourcesService = new ResourcesService();
    const response = await resourcesService.getById(id);
    
    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: 404 }
      );
    }
    
    return NextResponse.json(response.resource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    );
  }
}
