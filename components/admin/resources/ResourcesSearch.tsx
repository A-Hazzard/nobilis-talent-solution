'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ResourcesSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

/**
 * Search component for resources
 * Provides search functionality with icon and placeholder
 */
export function ResourcesSearch({ searchTerm, setSearchTerm }: ResourcesSearchProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardContent>
    </Card>
  );
} 