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
import { Upload, X } from 'lucide-react';
import type { ResourceFormData } from '@/lib/hooks/useResources';

interface ResourceFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ResourceFormData;
  setFormData: (data: Partial<ResourceFormData>) => void;
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  isEdit: boolean;
  getAcceptedTypes: (type: ResourceFormData['type']) => string[];
}

/**
 * Form component for adding and editing resources
 * Handles form inputs, file uploads, and submission
 */
export function ResourceForm({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  selectedFile,
  onFileSelect,
  onFileRemove,
  onSubmit,
  isSubmitting,
  isEdit,
  getAcceptedTypes,
}: ResourceFormProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Resource' : 'Add New Resource'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the resource details below.' : 'Enter the resource details below.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ title: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ description: e.target.value })}
              className="col-span-3"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ type: value as any })}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="docx">Document</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ category: value as any })}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leadership">Leadership</SelectItem>
                <SelectItem value="management">Management</SelectItem>
                <SelectItem value="strategy">Strategy</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="templates">Templates</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fileUrl" className="text-right">File URL</Label>
            <Input
              id="fileUrl"
              value={formData.fileUrl}
              onChange={(e) => setFormData({ fileUrl: e.target.value })}
              className="col-span-3"
              placeholder="https://example.com/file.pdf"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Upload File</Label>
            <div className="col-span-3">
              {selectedFile ? (
                <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onFileRemove}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    Accepted types: {getAcceptedTypes(formData.type).join(', ')}
                  </p>
                  <input
                    type="file"
                    accept={getAcceptedTypes(formData.type).map(type => `.${type}`).join(',')}
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="mt-2"
                  >
                    Choose File
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isPublic" className="text-right">Status</Label>
            <Select value={formData.isPublic.toString()} onValueChange={(value) => setFormData({ isPublic: value === 'true' })}>
              <SelectTrigger className="col-span-3">
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
          <Button type="submit" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Resource' : 'Add Resource')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 