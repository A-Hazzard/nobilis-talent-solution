import { NextRequest, NextResponse } from 'next/server';
import { ResourcesService } from '@/lib/services/ResourcesService';
import type { Resource } from '@/shared/types/entities';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as Resource['category'] | null;
    const type = searchParams.get('type') as Resource['type'] | null;
    const search = searchParams.get('search');

    const resourcesService = new ResourcesService();
    
    // Get all resources for frontend pagination
    const response = await resourcesService.getAll({
      isPublic: true,
      category: category || undefined,
      type: type || undefined,
      search: search || undefined
    });

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      resources: response.resources,
      total: response.total || response.resources.length
    });
  } catch (error) {
    console.error('Error in resources API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
} 