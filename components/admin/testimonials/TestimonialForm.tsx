'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { TestimonialFormData } from '@/lib/types/hooks';

interface TestimonialFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: TestimonialFormData;
  setFormData: (data: Partial<TestimonialFormData>) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  isEdit: boolean;
}

/**
 * Form component for adding and editing testimonials
 * Handles form inputs and submission
 */
export function TestimonialForm({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  isEdit,
}: TestimonialFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Testimonial' : 'Add New Testimonial'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the testimonial details below.' : 'Enter the testimonial details below.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
            <Label htmlFor="clientName" className="text-sm sm:text-base sm:text-right">Client Name</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => setFormData({ clientName: e.target.value })}
              className="col-span-1 sm:col-span-3 text-sm sm:text-base"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
            <Label htmlFor="company" className="text-sm sm:text-base sm:text-right">Company</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ company: e.target.value })}
              className="col-span-1 sm:col-span-3 text-sm sm:text-base"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
            <Label htmlFor="content" className="text-sm sm:text-base sm:text-right">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ content: e.target.value })}
              className="col-span-1 sm:col-span-3 text-sm sm:text-base"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
            <Label htmlFor="rating" className="text-sm sm:text-base sm:text-right">Rating</Label>
            <Select value={formData.rating.toString()} onValueChange={(value) => setFormData({ rating: parseInt(value) })}>
              <SelectTrigger className="col-span-1 sm:col-span-3 text-sm sm:text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Star</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
            <Label htmlFor="isPublic" className="text-sm sm:text-base sm:text-right">Status</Label>
            <Select value={formData.isPublic.toString()} onValueChange={(value) => setFormData({ isPublic: value === 'true' })}>
              <SelectTrigger className="col-span-1 sm:col-span-3 text-sm sm:text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Published</SelectItem>
                <SelectItem value="false">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
        <DialogFooter>
          <Button type="submit" onClick={onSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Testimonial' : 'Add Testimonial')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 