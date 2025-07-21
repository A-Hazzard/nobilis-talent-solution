import { useState, useEffect, useCallback } from 'react';
import type { Testimonial } from '@/shared/types/entities';
import { TestimonialsService } from '@/lib/services/TestimonialsService';
import { toast } from 'sonner';

export interface TestimonialFormData {
  clientName: string;
  company: string;
  content: string;
  rating: number;
  isPublic: boolean;
}

export interface TestimonialsState {
  testimonials: Testimonial[];
  isLoading: boolean;
  searchTerm: string;
  error: string | null;
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  editingTestimonial: Testimonial | null;
  formData: TestimonialFormData;
  isSubmitting: boolean;
}

export interface TestimonialsActions {
  loadTestimonials: () => Promise<void>;
  handleAddTestimonial: () => Promise<void>;
  handleEditTestimonial: () => Promise<void>;
  handleDeleteTestimonial: (id: string) => Promise<void>;
  openEditDialog: (testimonial: Testimonial) => void;
  resetForm: () => void;
  setSearchTerm: (term: string) => void;
  setIsAddDialogOpen: (open: boolean) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  setFormData: (data: Partial<TestimonialFormData>) => void;
  getStatusBadge: (isPublic: boolean) => { variant: string; className: string; icon: string; text: string };
  renderStars: (rating: number) => number[];
  formatDate: (date: Date) => string;
}

/**
 * Custom hook for testimonials state management
 * Handles CRUD operations, form state, and UI interactions
 */
export function useTestimonials(): [TestimonialsState, TestimonialsActions] {
  const [state, setState] = useState<TestimonialsState>({
    testimonials: [],
    isLoading: true,
    searchTerm: '',
    error: null,
    isAddDialogOpen: false,
    isEditDialogOpen: false,
    editingTestimonial: null,
    formData: {
      clientName: '',
      company: '',
      content: '',
      rating: 5,
      isPublic: true,
    },
    isSubmitting: false,
  });

  const testimonialsService = new TestimonialsService();

  const loadTestimonials = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await testimonialsService.getAll({ 
        search: state.searchTerm || undefined 
      });
      
      if (response.error) {
        setState(prev => ({ ...prev, error: response.error || 'Unknown error' }));
      } else {
        setState(prev => ({ ...prev, testimonials: response.testimonials }));
      }
    } catch (error) {
      console.error('Failed to load testimonials:', error);
      setState(prev => ({ ...prev, error: 'Failed to load testimonials' }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.searchTerm, testimonialsService]);

  // Separate effect for initial load
  useEffect(() => {
    loadTestimonials();
  }, []); // Only run on mount

  // Separate effect for search term changes
  useEffect(() => {
    if (state.searchTerm !== undefined) {
      loadTestimonials();
    }
  }, [state.searchTerm]); // Only depend on searchTerm

  const handleAddTestimonial = useCallback(async () => {
    const { formData } = state;
    
    if (!formData.clientName || !formData.company || !formData.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.rating < 1 || formData.rating > 5) {
      toast.error("Rating must be between 1 and 5");
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const response = await testimonialsService.create(formData);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Testimonial added successfully");
        setState(prev => ({ 
          ...prev, 
          isAddDialogOpen: false,
          isSubmitting: false 
        }));
        resetForm();
        await loadTestimonials();
        
        // Find and scroll to the newly added testimonial
        setTimeout(() => {
          const newTestimonialElement = document.querySelector(`[data-testimonial-id="${response.id}"]`);
          if (newTestimonialElement) {
            newTestimonialElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            newTestimonialElement.classList.add('bg-green-50', 'border-green-200');
            setTimeout(() => {
              newTestimonialElement.classList.remove('bg-green-50', 'border-green-200');
            }, 2000);
          }
        }, 100);
      }
    } catch (error) {
      toast.error("Failed to add testimonial");
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state.formData, testimonialsService, loadTestimonials]);

  const handleEditTestimonial = useCallback(async () => {
    const { editingTestimonial, formData } = state;
    
    if (!editingTestimonial) return;
    
    if (!formData.clientName || !formData.company || !formData.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.rating < 1 || formData.rating > 5) {
      toast.error("Rating must be between 1 and 5");
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const response = await testimonialsService.update(editingTestimonial.id, formData);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Testimonial updated successfully");
        setState(prev => ({ 
          ...prev, 
          isEditDialogOpen: false,
          editingTestimonial: null,
          isSubmitting: false 
        }));
        resetForm();
        await loadTestimonials();
        
        // Find and scroll to the updated testimonial
        setTimeout(() => {
          const updatedTestimonialElement = document.querySelector(`[data-testimonial-id="${editingTestimonial.id}"]`);
          if (updatedTestimonialElement) {
            updatedTestimonialElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            updatedTestimonialElement.classList.add('bg-blue-50', 'border-blue-200');
            setTimeout(() => {
              updatedTestimonialElement.classList.remove('bg-blue-50', 'border-blue-200');
            }, 2000);
          }
        }, 100);
      }
    } catch (error) {
      toast.error("Failed to update testimonial");
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state.editingTestimonial, state.formData, testimonialsService, loadTestimonials]);

  const handleDeleteTestimonial = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    
    try {
      const response = await testimonialsService.delete(id);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Testimonial deleted successfully");
        await loadTestimonials();
      }
    } catch (error) {
      toast.error("Failed to delete testimonial");
    }
  }, [testimonialsService, loadTestimonials]);

  const openEditDialog = useCallback((testimonial: Testimonial) => {
    setState(prev => ({
      ...prev,
      editingTestimonial: testimonial,
      formData: {
        clientName: testimonial.clientName,
        company: testimonial.company,
        content: testimonial.content,
        rating: testimonial.rating,
        isPublic: testimonial.isPublic,
      },
      isEditDialogOpen: true,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      formData: {
        clientName: '',
        company: '',
        content: '',
        rating: 5,
        isPublic: true,
      },
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

  const setFormData = useCallback((data: Partial<TestimonialFormData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data },
    }));
  }, []);

  const getStatusBadge = useCallback((isPublic: boolean) => {
    return isPublic ? {
      variant: 'default',
      className: 'flex items-center gap-1',
      icon: 'Eye',
      text: 'Published'
    } : {
      variant: 'secondary',
      className: 'flex items-center gap-1',
      icon: 'EyeOff',
      text: 'Draft'
    };
  }, []);

  const renderStars = useCallback((rating: number) => {
    return Array.from({ length: 5 }, (_, i) => i < rating ? 1 : 0);
  }, []);

  const formatDate = useCallback((date: Date) => {
    return new Date(date).toLocaleDateString();
  }, []);

  const actions: TestimonialsActions = {
    loadTestimonials,
    handleAddTestimonial,
    handleEditTestimonial,
    handleDeleteTestimonial,
    openEditDialog,
    resetForm,
    setSearchTerm,
    setIsAddDialogOpen,
    setIsEditDialogOpen,
    setFormData,
    getStatusBadge,
    renderStars,
    formatDate,
  };

  return [state, actions];
} 