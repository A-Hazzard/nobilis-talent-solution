import { NextRequest, NextResponse } from 'next/server';
import type { LeadsResponse } from '@/shared/types/api';

// Mock leads data
const mockLeads = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    company: 'TechCorp Inc.',
    phone: '+1-555-0123',
    challenges: 'Team communication and leadership development',
    status: 'new' as const,
    source: 'website' as const,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@startup.io',
    company: 'StartupXYZ',
    phone: '+1-555-0456',
    challenges: 'Scaling team and maintaining culture',
    status: 'contacted' as const,
    source: 'referral' as const,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
    notes: 'Interested in team building workshops',
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'mchen@enterprise.com',
    company: 'Enterprise Solutions',
    phone: '+1-555-0789',
    challenges: 'Strategic planning and execution',
    status: 'qualified' as const,
    source: 'social' as const,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-14'),
    demoScheduled: new Date('2024-01-20'),
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@consulting.com',
    company: 'Davis Consulting',
    phone: '+1-555-0321',
    challenges: 'Client relationship management',
    status: 'converted' as const,
    source: 'website' as const,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-18'),
    paymentStatus: 'completed' as const,
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'dwilson@manufacturing.com',
    company: 'Wilson Manufacturing',
    phone: '+1-555-0654',
    challenges: 'Operational efficiency and leadership',
    status: 'lost' as const,
    source: 'other' as const,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-16'),
    notes: 'Budget constraints, will follow up in Q2',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Filter leads based on search term
    let filteredLeads = mockLeads;
    if (search) {
      filteredLeads = mockLeads.filter(
        lead =>
          lead.name.toLowerCase().includes(search.toLowerCase()) ||
          lead.email.toLowerCase().includes(search.toLowerCase()) ||
          lead.company.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

    const response: LeadsResponse = {
      leads: paginatedLeads,
      total: filteredLeads.length,
      page,
      limit,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Leads error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 