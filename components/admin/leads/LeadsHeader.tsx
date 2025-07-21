import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface LeadsHeaderProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
}

/**
 * Header component for leads page
 * Contains title, description, and add lead button
 */
export function LeadsHeader({ isAddDialogOpen, setIsAddDialogOpen }: LeadsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
        <p className="text-gray-600">Manage potential clients and leads</p>
      </div>
      <Button onClick={() => setIsAddDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Lead
      </Button>
    </div>
  );
} 