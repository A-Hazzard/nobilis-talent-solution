import { NextRequest, NextResponse } from 'next/server';
import { BlogService } from '@/lib/services/BlogService';
import type { BlogPost } from '@/shared/types/entities';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as BlogPost['category'] | null;
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page');
    const pageSize = searchParams.get('pageSize');

    const blogService = new BlogService();
    
    // Calculate pagination
    const currentPage = page ? parseInt(page) : 1;
    const itemsPerPage = pageSize ? parseInt(pageSize) : (limit ? parseInt(limit) : 20);
    const offset = (currentPage - 1) * itemsPerPage;

    const response = await blogService.getAll({
      status: 'published',
      category: category || undefined,
      search: search || undefined,
      limit: limit ? parseInt(limit) : undefined,
      page: currentPage,
      pageSize: itemsPerPage,
      offset: offset
    });

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      posts: response.posts,
      total: response.total || response.posts.length,
      page: currentPage,
      pageSize: itemsPerPage,
      totalPages: response.total ? Math.ceil(response.total / itemsPerPage) : 1,
      hasMore: response.hasMore || false
    });
  } catch (error) {
    console.error('Error in blog API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
} 