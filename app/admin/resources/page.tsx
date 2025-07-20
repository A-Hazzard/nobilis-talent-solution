'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, FileText, Plus, Search, MoreHorizontal, Download, Edit, Trash2, Upload, Link, File, Eye, Play, Image } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
import { ResourcesService } from '@/lib/services/ResourcesService';
import { toast } from 'sonner';
import type { Resource } from '@/shared/types/entities';

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pdf' as Resource['type'],
    category: 'leadership' as Resource['category'],
    fileUrl: '',
    isPublic: true,
    createdBy: 'admin', // Default admin user ID
  });
  const resourcesService = new ResourcesService();

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await resourcesService.getAll({ search: searchTerm || undefined });
      if (response.error) {
        setError(response.error);
      } else {
        setResources(response.resources);
      }
    } catch (error) {
      console.error('Failed to load resources:', error);
      setError('Failed to load resources');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Update form data with file name for display
    setFormData(prev => ({ ...prev, title: file.name.split('.')[0] }));
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const openPreviewDialog = (resource: Resource) => {
    setPreviewResource(resource);
    setPreviewFile(null);
    setIsPreviewDialogOpen(true);
  };

  const openFilePreview = (file: File) => {
    setPreviewFile(file);
    setPreviewResource(null);
    setIsPreviewDialogOpen(true);
  };

  const getPreviewContent = () => {
    if (previewFile) {
      return renderFilePreview(previewFile);
    }
    if (previewResource) {
      return renderResourcePreview(previewResource);
    }
    return null;
  };

  const renderFilePreview = (file: File) => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileType.startsWith('image/') || fileName.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
      return (
        <div className="flex justify-center">
          <img 
            src={URL.createObjectURL(file)} 
            alt={file.name}
            className="max-w-full max-h-96 object-contain rounded-lg"
          />
        </div>
      );
    }

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return (
        <div className="w-full h-96">
          <iframe
            src={URL.createObjectURL(file)}
            className="w-full h-full border rounded-lg"
            title={file.name}
          />
        </div>
      );
    }

    if (fileType.startsWith('video/') || fileName.match(/\.(mp4|mov|avi|webm|mkv)$/)) {
      return (
        <div className="flex justify-center">
          <video 
            controls 
            className="max-w-full max-h-96 rounded-lg"
            src={URL.createObjectURL(file)}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (fileType.startsWith('audio/') || fileName.match(/\.(mp3|wav|ogg|m4a|aac)$/)) {
      return (
        <div className="flex justify-center">
          <audio 
            controls 
            className="w-full max-w-md"
            src={URL.createObjectURL(file)}
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    // For other file types, show file info
    return (
      <div className="text-center p-8">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{file.name}</h3>
        <p className="text-sm text-gray-500 mb-4">
          Size: {formatFileSize(file.size)}
        </p>
        <p className="text-sm text-gray-500">
          Type: {file.type || 'Unknown'}
        </p>
      </div>
    );
  };

  const renderResourcePreview = (resource: Resource) => {
    if (resource.type === 'video' && resource.fileUrl) {
      // Handle YouTube videos
      if (resource.fileUrl.includes('youtube.com') || resource.fileUrl.includes('youtu.be')) {
        const videoId = extractYouTubeVideoId(resource.fileUrl);
        if (videoId) {
          return (
            <div className="flex justify-center">
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={resource.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              />
            </div>
          );
        }
      }
      // Handle direct video URLs
      return (
        <div className="flex justify-center">
          <video 
            controls 
            className="max-w-full max-h-96 rounded-lg"
            src={resource.fileUrl}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (resource.type === 'image' && resource.fileUrl) {
      return (
        <div className="flex justify-center">
          <img 
            src={resource.fileUrl} 
            alt={resource.title}
            className="max-w-full max-h-96 object-contain rounded-lg"
          />
        </div>
      );
    }

    if (resource.type === 'audio' && resource.fileUrl) {
      return (
        <div className="flex justify-center">
          <audio 
            controls 
            className="w-full max-w-md"
            src={resource.fileUrl}
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    if ((resource.type === 'pdf' || resource.type === 'docx') && resource.fileUrl) {
      return (
        <div className="w-full h-96">
          <iframe
            src={resource.fileUrl}
            className="w-full h-full border rounded-lg"
            title={resource.title}
          />
        </div>
      );
    }

    // Fallback for unsupported types or missing URLs
    return (
      <div className="text-center p-8">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{resource.title}</h3>
        <p className="text-sm text-gray-500 mb-4">{resource.description}</p>
        <p className="text-sm text-gray-500">
          Type: {resource.type} | Size: {resource.fileSize ? formatFileSize(resource.fileSize) : 'Unknown'}
        </p>
        {resource.fileUrl && (
          <div className="mt-4">
            <Button asChild>
              <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Download File
              </a>
            </Button>
          </div>
        )}
      </div>
    );
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleAddResource = async () => {
    console.log('handleAddResource called', { formData, selectedFile });
    
    if (!formData.title || !formData.description) {
      console.log('Validation failed: missing title or description');
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.type !== 'video' && !selectedFile && !formData.fileUrl) {
      console.log('Validation failed: no file or URL provided');
      toast.error("Please select a file or provide a URL");
      return;
    }

    setIsUploading(true);
    try {
      console.log('Calling resourcesService.create with:', { formData, file: selectedFile });
      const response = await resourcesService.create(formData, selectedFile || undefined);
      console.log('ResourcesService.create response:', response);
      
      if (response.error) {
        console.error('Resource creation failed:', response.error);
        toast.error(response.error);
        // Keep modal open on error
      } else {
        console.log('Resource created successfully with ID:', response.id);
        toast.success("Resource added successfully");
        setIsAddDialogOpen(false);
        resetForm();
        
        // Refresh data and scroll to new item
        console.log('Refreshing resources list...');
        await loadResources();
        
        // Find and scroll to the newly added resource
        setTimeout(() => {
          console.log('Looking for element with data-resource-id:', response.id);
          const newResourceElement = document.querySelector(`[data-resource-id="${response.id}"]`);
          console.log('Found element:', newResourceElement);
          if (newResourceElement) {
            newResourceElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            // Add a brief highlight effect
            newResourceElement.classList.add('bg-green-50', 'border-green-200');
            setTimeout(() => {
              newResourceElement.classList.remove('bg-green-50', 'border-green-200');
            }, 2000);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Exception in handleAddResource:', error);
      toast.error("Failed to add resource");
      // Keep modal open on error
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditResource = async () => {
    if (!editingResource) return;
    
    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsUploading(true);
    try {
      const response = await resourcesService.update(editingResource.id, formData, selectedFile || undefined);
      if (response.error) {
        toast.error(response.error);
        // Keep modal open on error
      } else {
        toast.success("Resource updated successfully");
        setIsEditDialogOpen(false);
        setEditingResource(null);
        resetForm();
        
        // Refresh data and scroll to updated item
        await loadResources();
        
        // Find and scroll to the updated resource
        setTimeout(() => {
          const updatedResourceElement = document.querySelector(`[data-resource-id="${editingResource.id}"]`);
          if (updatedResourceElement) {
            updatedResourceElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            // Add a brief highlight effect
            updatedResourceElement.classList.add('bg-blue-50', 'border-blue-200');
            setTimeout(() => {
              updatedResourceElement.classList.remove('bg-blue-50', 'border-blue-200');
            }, 2000);
          }
        }, 100);
      }
    } catch (error) {
      toast.error("Failed to update resource");
      // Keep modal open on error
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      const response = await resourcesService.delete(id);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Resource deleted successfully");
        loadResources();
      }
    } catch (error) {
      toast.error("Failed to delete resource");
    }
  };

  const openEditDialog = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      category: resource.category,
      fileUrl: resource.fileUrl,
      isPublic: resource.isPublic,
      createdBy: resource.createdBy,
    });
    setSelectedFile(null);
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'pdf',
      category: 'leadership',
      fileUrl: '',
      isPublic: true,
      createdBy: 'admin', // Default admin user ID
    });
    setSelectedFile(null);
  };

  const getStatusBadge = (isPublic: boolean) => {
    return isPublic ? (
      <Badge variant="default">Published</Badge>
    ) : (
      <Badge variant="secondary">Draft</Badge>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAcceptedTypes = (type: Resource['type']) => {
    switch (type) {
      case 'pdf':
        return ['pdf'];
      case 'docx':
        return ['docx'];
      case 'image':
        return ['image'];
      case 'video':
        return ['video'];
      case 'audio':
        return ['audio'];
      default:
        return ['pdf', 'docx', 'image', 'video', 'audio'];
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="h-12 w-12 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-600">Manage your leadership resources and materials</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
              <DialogDescription>
                Upload a file or provide a link to your resource.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="col-span-3"
                  placeholder="Resource title"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="col-span-3"
                  rows={3}
                  placeholder="Brief description of the resource"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Type</Label>
                <Select value={formData.type} onValueChange={(value: Resource['type']) => setFormData({ ...formData, type: value })}>
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
                <Select value={formData.category} onValueChange={(value: Resource['category']) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="team-building">Team Building</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="strategy">Strategy</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* File Upload Section */}
              {formData.type !== 'video' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">File</Label>
                  <div className="col-span-3">
                    <FileUpload
                      onFileSelect={handleFileSelect}
                      onFileRemove={handleFileRemove}
                      onFilePreview={openFilePreview}
                      selectedFile={selectedFile}
                      acceptedTypes={getAcceptedTypes(formData.type)}
                      disabled={isUploading}
                    />
                  </div>
                </div>
              )}

              {/* URL Input for Videos */}
              {formData.type === 'video' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fileUrl" className="text-right">Video URL</Label>
                  <Input
                    id="fileUrl"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    className="col-span-3"
                    placeholder="YouTube or video URL"
                  />
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isPublic" className="text-right">Status</Label>
                <Select value={formData.isPublic.toString()} onValueChange={(value) => setFormData({ ...formData, isPublic: value === 'true' })}>
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
              <Button 
                type="submit" 
                onClick={handleAddResource}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Add Resource'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
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

      {/* No Data State */}
      {!isLoading && !error && resources.length === 0 && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first resource.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Resource
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources Table */}
      {!isLoading && !error && resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Resources ({resources.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((resource) => (
                  <TableRow key={resource.id} data-resource-id={resource.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                          {resource.type === 'video' ? (
                            <Link className="h-5 w-5 text-primary" />
                          ) : (
                            <FileText className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{resource.title}</p>
                          <p className="text-sm text-gray-500">{resource.description}</p>
                          {resource.fileSize && (
                            <p className="text-xs text-gray-400">{formatFileSize(resource.fileSize)}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {resource.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Download className="h-4 w-4 text-gray-400" />
                        <span>{resource.downloadCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(resource.isPublic)}
                    </TableCell>
                    <TableCell>
                      {formatDate(resource.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openPreviewDialog(resource)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(resource)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteResource(resource.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
            <DialogDescription>
              Update the resource details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="col-span-3"
                placeholder="Resource title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
                rows={3}
                placeholder="Brief description of the resource"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">Type</Label>
              <Select value={formData.type} onValueChange={(value: Resource['type']) => setFormData({ ...formData, type: value })}>
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
              <Label htmlFor="edit-category" className="text-right">Category</Label>
              <Select value={formData.category} onValueChange={(value: Resource['category']) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leadership">Leadership</SelectItem>
                  <SelectItem value="team-building">Team Building</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="strategy">Strategy</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* File Upload Section for Edit */}
            {formData.type !== 'video' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">File</Label>
                <div className="col-span-3">
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    onFileRemove={handleFileRemove}
                    onFilePreview={openFilePreview}
                    selectedFile={selectedFile}
                    acceptedTypes={getAcceptedTypes(formData.type)}
                    disabled={isUploading}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Leave empty to keep current file
                  </p>
                </div>
              </div>
            )}

            {/* URL Input for Videos */}
            {formData.type === 'video' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-fileUrl" className="text-right">Video URL</Label>
                <Input
                  id="edit-fileUrl"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="col-span-3"
                  placeholder="YouTube or video URL"
                />
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-isPublic" className="text-right">Status</Label>
              <Select value={formData.isPublic.toString()} onValueChange={(value) => setFormData({ ...formData, isPublic: value === 'true' })}>
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
            <Button 
              type="submit" 
              onClick={handleEditResource}
              disabled={isUploading}
            >
              {isUploading ? 'Updating...' : 'Update Resource'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {previewResource ? `Preview: ${previewResource.title}` : 'File Preview'}
            </DialogTitle>
            <DialogDescription>
              {previewResource ? previewResource.description : 'Preview your uploaded file'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {getPreviewContent()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
              Close
            </Button>
            {previewResource?.fileUrl && (
              <Button asChild>
                <a href={previewResource.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 