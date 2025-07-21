import { useState, useEffect, useCallback } from 'react';
import type { Lead } from '@/shared/types/entities';
import { LeadsService } from '@/lib/services/LeadsService';
import { toast } from 'sonner';
import { validateSignupForm, validatePassword } from '@/lib/utils/validation';

export interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  organization: string;
  phone: string;
}

export interface FieldErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  organization?: string;
  challenges?: string;
}

export interface PasswordValidation {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasSpecialChar: boolean;
}

export interface LeadsState {
  leads: Lead[];
  isLoading: boolean;
  searchTerm: string;
  currentPage: number;
  totalLeads: number;
  error: string | null;
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  editingLead: Lead | null;
  isSubmitting: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  fieldErrors: FieldErrors;
  passwordValidation: PasswordValidation;
  formData: LeadFormData;
}

export interface LeadsActions {
  loadLeads: () => Promise<void>;
  handleAddLead: () => Promise<void>;
  handleEditLead: () => Promise<void>;
  handleDeleteLead: (id: string) => Promise<void>;
  openEditDialog: (lead: Lead) => void;
  resetForm: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  setIsAddDialogOpen: (open: boolean) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
  formatDate: (date: Date) => string;
  getFieldError: (fieldName: string) => string | undefined;
  isFieldValid: (fieldName: string) => boolean;
}

/**
 * Custom hook for leads state management
 * Handles CRUD operations, form validation, and pagination
 */
export function useLeads(): [LeadsState, LeadsActions] {
  const [state, setState] = useState<LeadsState>({
    leads: [],
    isLoading: true,
    searchTerm: '',
    currentPage: 1,
    totalLeads: 0,
    error: null,
    isAddDialogOpen: false,
    isEditDialogOpen: false,
    editingLead: null,
    isSubmitting: false,
    showPassword: false,
    showConfirmPassword: false,
    fieldErrors: {},
    passwordValidation: {
      hasMinLength: false,
      hasUppercase: false,
      hasSpecialChar: false,
    },
    formData: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      organization: '',
      phone: '',
    },
  });

  const leadsService = new LeadsService();

  const loadLeads = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await leadsService.getAll({
        page: state.currentPage,
        limit: 10,
        search: state.searchTerm || undefined,
      });
      
      if (response.error) {
        setState(prev => ({ ...prev, error: response.error || 'Unknown error' }));
      } else {
        setState(prev => ({ 
          ...prev, 
          leads: response.leads,
          totalLeads: response.total 
        }));
      }
    } catch (error) {
      console.error('Failed to load leads:', error);
      setState(prev => ({ ...prev, error: 'Failed to load leads' }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.currentPage, state.searchTerm, leadsService]);

  const handleAddLead = useCallback(async () => {
    const { formData } = state;
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const { id, error } = await leadsService.create(formData);
      
      if (error) {
        setState(prev => ({ ...prev, error }));
        toast.error(error);
      } else {
        toast.success("Lead account created successfully!");
        setState(prev => ({ 
          ...prev, 
          isAddDialogOpen: false,
          isSubmitting: false 
        }));
        resetForm();
        await loadLeads();
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to create lead account',
        isSubmitting: false 
      }));
      toast.error('Failed to create lead account');
    }
  }, [state.formData, leadsService, loadLeads]);

  const handleEditLead = useCallback(async () => {
    const { editingLead, formData } = state;
    
    if (!editingLead) return;
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const response = await leadsService.update(editingLead.id, formData);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Lead updated successfully");
        setState(prev => ({ 
          ...prev, 
          isEditDialogOpen: false,
          editingLead: null,
          isSubmitting: false 
        }));
        resetForm();
        await loadLeads();
        
        // Find and scroll to the updated lead
        setTimeout(() => {
          const updatedLeadElement = document.querySelector(`[data-lead-id="${editingLead.id}"]`);
          if (updatedLeadElement) {
            updatedLeadElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            updatedLeadElement.classList.add('bg-blue-50', 'border-blue-200');
            setTimeout(() => {
              updatedLeadElement.classList.remove('bg-blue-50', 'border-blue-200');
            }, 2000);
          }
        }, 100);
      }
    } catch (error) {
      toast.error("Failed to update lead");
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state.editingLead, state.formData, leadsService, loadLeads]);

  const handleDeleteLead = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      const response = await leadsService.delete(id);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Lead deleted successfully");
        await loadLeads();
      }
    } catch (error) {
      toast.error("Failed to delete lead");
    }
  }, [leadsService, loadLeads]);

  const openEditDialog = useCallback((lead: Lead) => {
    setState(prev => ({
      ...prev,
      editingLead: lead,
      formData: {
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        password: '',
        confirmPassword: '',
        organization: lead.organization || '',
        phone: lead.phone || '',
      },
      isEditDialogOpen: true,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      formData: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        organization: '',
        phone: '',
      },
      fieldErrors: {},
      passwordValidation: {
        hasMinLength: false,
        hasUppercase: false,
        hasSpecialChar: false,
      },
      showPassword: false,
      showConfirmPassword: false,
    }));
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setState(prev => ({ 
      ...prev, 
      formData: { ...prev.formData, [name]: value },
      error: null 
    }));

    // Clear field-specific error when user starts typing
    if (state.fieldErrors[name as keyof FieldErrors]) {
      setState(prev => ({ 
        ...prev, 
        fieldErrors: { ...prev.fieldErrors, [name]: undefined } 
      }));
    }

    // Real-time password validation
    if (name === 'password') {
      const validation = validatePassword(value);
      setState(prev => ({
        ...prev,
        passwordValidation: {
          hasMinLength: validation.hasMinLength,
          hasUppercase: validation.hasUppercase,
          hasSpecialChar: validation.hasSpecialChar,
        },
      }));
    }

    // Real-time validation for other fields
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        setState(prev => ({
          ...prev,
          fieldErrors: { ...prev.fieldErrors, email: 'Please enter a valid email address' }
        }));
      } else {
        setState(prev => ({
          ...prev,
          fieldErrors: { ...prev.fieldErrors, email: undefined }
        }));
      }
    }

    if (name === 'firstName' || name === 'lastName') {
      const fieldName = name === 'firstName' ? 'First name' : 'Last name';
      if (value && value.trim().length < 3) {
        setState(prev => ({
          ...prev,
          fieldErrors: { ...prev.fieldErrors, [name]: `${fieldName} must be at least 3 characters long` }
        }));
      } else {
        setState(prev => ({
          ...prev,
          fieldErrors: { ...prev.fieldErrors, [name]: undefined }
        }));
      }
    }

    if (name === 'organization' && value) {
      if (value.trim().length < 3) {
        setState(prev => ({
          ...prev,
          fieldErrors: { ...prev.fieldErrors, organization: 'Organization must be at least 3 characters long' }
        }));
      } else {
        setState(prev => ({
          ...prev,
          fieldErrors: { ...prev.fieldErrors, organization: undefined }
        }));
      }
    }

    if (name === 'phone' && value) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
        setState(prev => ({
          ...prev,
          fieldErrors: { ...prev.fieldErrors, phone: 'Please enter a valid phone number' }
        }));
      } else {
        setState(prev => ({
          ...prev,
          fieldErrors: { ...prev.fieldErrors, phone: undefined }
        }));
      }
    }
  }, [state.fieldErrors]);

  const setSearchTerm = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term, currentPage: 1 }));
  }, []);

  const setCurrentPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const setIsAddDialogOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, isAddDialogOpen: open }));
  }, []);

  const setIsEditDialogOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, isEditDialogOpen: open }));
  }, []);

  const setShowPassword = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showPassword: show }));
  }, []);

  const setShowConfirmPassword = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showConfirmPassword: show }));
  }, []);

  const formatDate = useCallback((date: Date) => {
    return new Date(date).toLocaleDateString();
  }, []);

  const getFieldError = useCallback((fieldName: string) => {
    return state.fieldErrors[fieldName as keyof FieldErrors];
  }, [state.fieldErrors]);

  const isFieldValid = useCallback((fieldName: string) => {
    return !getFieldError(fieldName) && state.formData[fieldName as keyof LeadFormData]?.trim() !== '';
  }, [getFieldError, state.formData]);

  useEffect(() => {
    loadLeads();
  }, []); // Only run on mount

  // Separate effect for search term changes
  useEffect(() => {
    if (state.searchTerm !== undefined) {
      loadLeads();
    }
  }, [state.searchTerm]); // Only depend on searchTerm

  const actions: LeadsActions = {
    loadLeads,
    handleAddLead,
    handleEditLead,
    handleDeleteLead,
    openEditDialog,
    resetForm,
    handleInputChange,
    setSearchTerm,
    setCurrentPage,
    setIsAddDialogOpen,
    setIsEditDialogOpen,
    setShowPassword,
    setShowConfirmPassword,
    formatDate,
    getFieldError,
    isFieldValid,
  };

  return [state, actions];
} 