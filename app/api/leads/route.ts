import { NextRequest, NextResponse } from 'next/server';
import { LeadsService } from '@/lib/services/LeadsService';
import type { LeadsResponse } from '@/shared/types/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const leadsService = new LeadsService();
    const { leads, total, error } = await leadsService.getAll({ 
      page, 
      limit, 
      search 
    });

    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 500 }
      );
    }

    const response: LeadsResponse = {
      leads,
      total,
      page,
      limit,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Leads API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 