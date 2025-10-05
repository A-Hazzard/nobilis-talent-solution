import { NextRequest, NextResponse } from 'next/server';
import { ResourcesService } from '@/lib/services/ResourcesService';
import { getAuth } from '@/lib/helpers/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const auth = await getAuth(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }

    const resourcesService = new ResourcesService();
    
    // Get the resource details
    const resourceResponse = await resourcesService.getById(id);
    if (resourceResponse.error || !resourceResponse.resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    const resource = resourceResponse.resource;
    
    // Increment download count
    const incrementResponse = await resourcesService.incrementDownloadCount(id);
    if (incrementResponse.error) {
      console.error('Error incrementing download count:', incrementResponse.error);
      // Continue with download even if count increment fails
    }

    // Check if fileUrl exists
    if (!resource.fileUrl) {
      return NextResponse.json(
        { error: 'File not available for download' },
        { status: 404 }
      );
    }

    // Return the file URL and metadata for download
    return NextResponse.json({ 
      success: true, 
      fileUrl: resource.fileUrl,
      fileName: resource.title,
      fileType: resource.type,
      fileSize: resource.fileSize,
      downloadCount: resource.downloadCount + 1
    });
  } catch (error) {
    console.error('Error processing download:', error);
    return NextResponse.json(
      { error: 'Failed to process download' },
      { status: 500 }
    );
  }
}

// Also handle GET requests for direct file access
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const auth = await getAuth(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }

    const resourcesService = new ResourcesService();
    
    // Get the resource details
    const resourceResponse = await resourcesService.getById(id);
    if (resourceResponse.error || !resourceResponse.resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    const resource = resourceResponse.resource;
    
    // Check if fileUrl exists
    if (!resource.fileUrl) {
      return NextResponse.json(
        { error: 'File not available for download' },
        { status: 404 }
      );
    }

    // For GET requests, redirect to the actual file URL
    return NextResponse.redirect(resource.fileUrl);
  } catch (error) {
    console.error('Error processing download:', error);
    return NextResponse.json(
      { error: 'Failed to process download' },
      { status: 500 }
    );
  }
} 