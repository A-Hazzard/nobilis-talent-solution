/**
 * Frontend hook types for state management
 */

import type { Testimonial, Lead, Resource, CalendarEvent, Analytics } from '@/shared/types/entities';

// Testimonials Hook Types
export type TestimonialFormData = {
  clientName: string;
  company: string;
  content: string;
  rating: number;
  isPublic: boolean;
};

export type TestimonialsState = {
  testimonials: Testimonial[];
  isLoading: boolean;
  searchTerm: string;
  error: string | null;
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  editingTestimonial: Testimonial | null;
  formData: TestimonialFormData;
  isSubmitting: boolean;
};

export type TestimonialsActions = {
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
};

// Leads Hook Types
export type LeadFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  organization: string;
  phone: string;
  // Onboarding fields
  jobTitle?: string;
  organizationType?: 'startup' | 'small-business' | 'enterprise' | 'nonprofit' | 'other';
  industryFocus?: string;
  teamSize?: string;
  primaryGoals?: string[];
  challengesDescription?: string;
  timeline?: string;
  budget?: string;
};

export type FieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  organization?: string;
  challenges?: string;
};

export type PasswordValidation = {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasSpecialChar: boolean;
};

export type LeadsState = {
  leads: Lead[];
  isLoading: boolean;
  searchTerm: string;
  // Simple filters used in the Leads page UI
  filters: {
    organizationType: string;
    teamSize: string;
  };
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
};

export type LeadsActions = {
  loadLeads: () => Promise<void>;
  handleAddLead: () => Promise<void>;
  handleEditLead: () => Promise<void>;
  handleDeleteLead: (id: string) => Promise<void>;
  openEditDialog: (lead: Lead) => void;
  resetForm: () => void;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: { organizationType?: string; teamSize?: string }) => void;
  setIsAddDialogOpen: (open: boolean) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
  formatDate: (date: Date) => string;
  getFilteredLeads: () => Lead[];
};

// Resources Hook Types
export type ResourceFormData = {
  title: string;
  description: string;
  type: Resource['type'];
  category: Resource['category'];
  fileUrl: string;
  isPublic: boolean;
  createdBy: string;
};

export type ResourcesState = {
  resources: Resource[];
  isLoading: boolean;
  searchTerm: string;
  error: string | null;
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isPreviewDialogOpen: boolean;
  previewResource: Resource | null;
  previewFile: File | null;
  editingResource: Resource | null;
  selectedFile: File | null;
  isUploading: boolean;
  formData: ResourceFormData;
};

export type ResourcesActions = {
  loadResources: () => Promise<void>;
  handleFileSelect: (file: File) => void;
  handleFileRemove: () => void;
  openPreviewDialog: (resource: Resource) => void;
  openFilePreview: (file: File) => void;
  handleAddResource: () => Promise<void>;
  handleEditResource: () => Promise<void>;
  handleDeleteResource: (id: string) => Promise<void>;
  openEditDialog: (resource: Resource) => void;
  resetForm: () => void;
  setSearchTerm: (term: string) => void;
  setIsAddDialogOpen: (open: boolean) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  setIsPreviewDialogOpen: (open: boolean) => void;
  setFormData: (data: Partial<ResourceFormData>) => void;
  getStatusBadge: (isPublic: boolean) => { variant: string; text: string };
  formatDate: (date: Date) => string;
  formatFileSize: (bytes: number) => string;
  getAcceptedTypes: (type: Resource['type']) => string[];
  extractYouTubeVideoId: (url: string) => string | null;
  getPreviewContent: () => { type: 'file'; file: File } | { type: 'resource'; resource: Resource } | null;
};

// Calendar Hook Types
export type EventFormData = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  attendees: number;
  type: CalendarEvent['type'];
};

export type CalendarState = {
  events: CalendarEvent[];
  isLoading: boolean;
  currentMonth: Date;
  isModalOpen: boolean;
  editingEvent: CalendarEvent | null;
  form: EventFormData;
  formError: string | null;
  calendlyAuthStatus: 'connected' | 'disconnected' | 'error' | 'connecting';
  syncStatus: 'disconnected' | 'syncing' | 'success' | 'error';
  lastSyncTime: Date | null;
  syncStats: { synced: number; total: number };
  showInstructions: boolean;
  connectionAttempts: number;
  maxConnectionAttempts: number;
};

export type CalendarActions = {
  loadEvents: (forceConnectionStatus?: 'connected' | 'disconnected' | 'error') => Promise<void>;
  syncCalendlyEvents: () => Promise<void>;
  connectCalendly: () => void;
  handleOpenModal: (event?: CalendarEvent) => void;
  handleCloseModal: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleDeleteEvent: (eventId: string) => Promise<void>;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTypeChange: (value: string) => void;
  handleDateChange: (date: Date | undefined) => void;
  handleTimeChange: (field: 'startTime' | 'endTime', value: string) => void;
  changeMonth: (direction: 'prev' | 'next') => void;
  setMonth: (date: Date) => void;
  openCalendlyBooking: () => void;
  closeCalendlyBooking: () => void;
  toggleInstructions: () => void;
  checkCalendlyConnection: () => Promise<'connected' | 'disconnected' | 'error'>;
};

// Dashboard Hook Types
export type DashboardState = {
  analytics: Analytics | null;
  isLoading: boolean;
  period: 'week' | 'month' | 'year';
  recentActivity: any[];
  error: string | null;
};

export type DashboardActions = {
  loadDashboardData: () => Promise<void>;
  setPeriod: (period: 'week' | 'month' | 'year') => void;
  getStats: () => Array<{
    title: string;
    value: string | number;
    change: string | number;
    icon: any;
    color: string;
    bgColor: string;
  }>;
}; 