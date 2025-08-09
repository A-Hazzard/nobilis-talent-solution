'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface LeadsSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters?: { organizationType?: string; teamSize?: string };
  setFilters?: (f: { organizationType?: string; teamSize?: string }) => void;
}

/**
 * Search component for leads
 * Provides search functionality with icon and placeholder
 */
export function LeadsSearch({ searchTerm, setSearchTerm, filters, setFilters }: LeadsSearchProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filters?.organizationType || ''}
            onChange={(e) => setFilters?.({ organizationType: e.target.value })}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Org Types</option>
            <option value="startup">Startup</option>
            <option value="small-business">Small Business</option>
            <option value="enterprise">Enterprise</option>
            <option value="nonprofit">Non-Profit</option>
            <option value="other">Other</option>
          </select>
          <select
            value={filters?.teamSize || ''}
            onChange={(e) => setFilters?.({ teamSize: e.target.value })}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Team Sizes</option>
            <option value="1-10 employees">1-10</option>
            <option value="11-50 employees">11-50</option>
            <option value="51-200 employees">51-200</option>
            <option value="201-1000 employees">201-1000</option>
            <option value="1000+ employees">1000+</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
} 