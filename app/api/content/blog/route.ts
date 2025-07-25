import { NextRequest, NextResponse } from 'next/server';
import { BlogService } from '@/lib/services/BlogService';
import type { BlogPost } from '@/shared/types/entities';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as BlogPost['category'] | null;
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');

    const blogService = new BlogService();
    
    const response = await blogService.getAll({
      status: 'published',
      category: category || undefined,
      search: search || undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      posts: response.posts,
      count: response.posts.length
    });
  } catch (error) {
    console.error('Error in blog API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
} 