import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ResourcesHeaderProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
}

/**
 * Header component for resources page
 * Contains title, description, and add resource button
 */
export function ResourcesHeader({ isAddDialogOpen, setIsAddDialogOpen }: ResourcesHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
        <p className="text-gray-600">Manage downloadable resources and content</p>
      </div>
      <Button onClick={() => setIsAddDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Resource
      </Button>
    </div>
  );
} 