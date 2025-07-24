'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface TestimonialsHeaderProps {
  setIsAddDialogOpen: (open: boolean) => void;
}

/**
 * Header component for testimonials page
 * Contains title, description, and add testimonial button
 */
export function TestimonialsHeader({ setIsAddDialogOpen }: TestimonialsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
        <p className="text-gray-600">Manage client testimonials and reviews</p>
      </div>
      <Button onClick={() => setIsAddDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Testimonial
      </Button>
    </div>
  );
} 