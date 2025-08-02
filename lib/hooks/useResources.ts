import { useState, useEffect, useCallback } from 'react';
import type { Resource } from '@/shared/types/entities';
import type { ResourceFormData, ResourcesState, ResourcesActions } from '@/lib/types/hooks';
import { ResourcesService } from '@/lib/services/ResourcesService';
import { toast } from 'sonner';

/**
 * Custom hook for resources state management
 * Handles CRUD operations, file uploads, and preview functionality
 */
export function useResources(): [ResourcesState, ResourcesActions] {
  const [state, setState] = useState<ResourcesState>({
    resources: [],
    isLoading: true,
    searchTerm: '',
    error: null,
    isAddDialogOpen: false,
    isEditDialogOpen: false,
    isPreviewDialogOpen: false,
    previewResource: null,
    previewFile: null,
    editingResource: null,
    selectedFile: null,
    isUploading: false,
    formData: {
      title: '',
      description: '',
      type: 'pdf',
      category: 'leadership',
      fileUrl: '',
      isPublic: true,
      createdBy: 'admin',
    },
  });

  const resourcesService = new ResourcesService();

  const loadResources = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await resourcesService.getAll({ 
        search: state.searchTerm || undefined 
      });
      
      if (response.error) {
        setState(prev => ({ ...prev, error: response.error || 'Unknown error' }));
      } else {
        setState(prev => ({ ...prev, resources: response.resources }));
      }
    } catch (error) {
      console.error('Failed to load resources:', error);
      setState(prev => ({ ...prev, error: 'Failed to load resources' }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.searchTerm, resourcesService]);

  const handleFileSelect = useCallback((file: File) => {
    setState(prev => ({ 
      ...prev, 
      selectedFile: file,
      formData: { ...prev.formData, title: file.name.split('.')[0] }
    }));
  }, []);

  const handleFileRemove = useCallback(() => {
    setState(prev => ({ ...prev, selectedFile: null }));
  }, []);

  const openPreviewDialog = useCallback((resource: Resource) => {
    setState(prev => ({
      ...prev,
      previewResource: resource,
      previewFile: null,
      isPreviewDialogOpen: true,
    }));
  }, []);

  const openFilePreview = useCallback((file: File) => {
    setState(prev => ({
      ...prev,
      previewFile: file,
      previewResource: null,
      isPreviewDialogOpen: true,
    }));
  }, []);

  const handleAddResource = useCallback(async () => {
    const { formData, selectedFile } = state;
    
    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.type !== 'video' && !selectedFile && !formData.fileUrl) {
      toast.error("Please select a file or provide a URL");
      return;
    }

    setState(prev => ({ ...prev, isUploading: true }));
    
    try {
      const response = await resourcesService.create(formData, selectedFile || undefined);
      
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Resource added successfully");
        setState(prev => ({ 
          ...prev, 
          isAddDialogOpen: false,
          isUploading: false 
        }));
        resetForm();
        await loadResources();
        
        // Find and scroll to the newly added resource
        setTimeout(() => {
          const newResourceElement = document.querySelector(`[data-resource-id="${response.id}"]`);
          if (newResourceElement) {
            newResourceElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            newResourceElement.classList.add('bg-green-50', 'border-green-200');
            setTimeout(() => {
              newResourceElement.classList.remove('bg-green-50', 'border-green-200');
            }, 2000);
          }
        }, 100);
      }
    } catch {
      toast.error("Failed to add resource");
    } finally {
      setState(prev => ({ ...prev, isUploading: false }));
    }
  }, [state.formData, state.selectedFile, resourcesService, loadResources]);

  const handleEditResource = useCallback(async () => {
    const { editingResource, formData, selectedFile } = state;
    
    if (!editingResource) return;
    
    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setState(prev => ({ ...prev, isUploading: true }));
    
    try {
      const response = await resourcesService.update(editingResource.id, formData, selectedFile || undefined);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Resource updated successfully");
        setState(prev => ({ 
          ...prev, 
          isEditDialogOpen: false,
          editingResource: null,
          isUploading: false 
        }));
        resetForm();
        await loadResources();
        
        // Find and scroll to the updated resource
        setTimeout(() => {
          const updatedResourceElement = document.querySelector(`[data-resource-id="${editingResource.id}"]`);
          if (updatedResourceElement) {
            updatedResourceElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            updatedResourceElement.classList.add('bg-blue-50', 'border-blue-200');
            setTimeout(() => {
              updatedResourceElement.classList.remove('bg-blue-50', 'border-blue-200');
            }, 2000);
          }
        }, 100);
      }
    } catch {
      toast.error("Failed to update resource");
    } finally {
      setState(prev => ({ ...prev, isUploading: false }));
    }
  }, [state.editingResource, state.formData, state.selectedFile, resourcesService, loadResources]);

  const handleDeleteResource = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      const response = await resourcesService.delete(id);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Resource deleted successfully");
        await loadResources();
      }
    } catch {
      toast.error("Failed to delete resource");
    }
  }, [resourcesService, loadResources]);

  const openEditDialog = useCallback((resource: Resource) => {
    setState(prev => ({
      ...prev,
      editingResource: resource,
      formData: {
        title: resource.title,
        description: resource.description,
        type: resource.type,
        category: resource.category,
        fileUrl: resource.fileUrl,
        isPublic: resource.isPublic,
        createdBy: resource.createdBy,
      },
      selectedFile: null,
      isEditDialogOpen: true,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      formData: {
        title: '',
        description: '',
        type: 'pdf',
        category: 'leadership',
        fileUrl: '',
        isPublic: true,
        createdBy: 'admin',
      },
      selectedFile: null,
    }));
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const setIsAddDialogOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, isAddDialogOpen: open }));
  }, []);

  const setIsEditDialogOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, isEditDialogOpen: open }));
  }, []);

  const setIsPreviewDialogOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, isPreviewDialogOpen: open }));
  }, []);

  const setFormData = useCallback((data: Partial<ResourceFormData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data },
    }));
  }, []);

  const getStatusBadge = useCallback((isPublic: boolean) => {
    return isPublic ? {
      variant: 'default',
      text: 'Published'
    } : {
      variant: 'secondary',
      text: 'Draft'
    };
  }, []);

  const formatDate = useCallback((date: Date) => {
    return new Date(date).toLocaleDateString();
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const getAcceptedTypes = useCallback((type: Resource['type']) => {
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
  }, []);

  const extractYouTubeVideoId = useCallback((url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }, []);

  const getPreviewContent = useCallback(() => {
    const { previewFile, previewResource } = state;
    
    if (previewFile) {
      return { type: 'file' as const, file: previewFile };
    }
    if (previewResource) {
      return { type: 'resource' as const, resource: previewResource };
    }
    return null;
  }, [state.previewFile, state.previewResource]);

  useEffect(() => {
    loadResources();
  }, []);

  // Separate effect for search term changes
  useEffect(() => {
    if (state.searchTerm !== undefined) {
      loadResources();
    }
  }, [state.searchTerm]);

  const actions: ResourcesActions = {
    loadResources,
    handleFileSelect,
    handleFileRemove,
    openPreviewDialog,
    openFilePreview,
    handleAddResource,
    handleEditResource,
    handleDeleteResource,
    openEditDialog,
    resetForm,
    setSearchTerm,
    setIsAddDialogOpen,
    setIsEditDialogOpen,
    setIsPreviewDialogOpen,
    setFormData,
    getStatusBadge,
    formatDate,
    formatFileSize,
    getAcceptedTypes,
    extractYouTubeVideoId,
    getPreviewContent,
  };

  return [state, actions];
} 