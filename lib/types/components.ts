// Component-specific type definitions

// Payment-related component types
export type PaymentWithActions = {
  id: string;
  clientEmail: string;
  clientName: string;
  baseAmount: number;
  bonusAmount?: number;
  totalAmount?: number;
  calculatedTotal?: number;
  description: string;
  status: 'pending' | 'completed' | 'cancelled' | 'overdue';
  createdAt: Date;
  expiresAt?: Date;
  stripeSessionId?: string;
  notes?: string;
  updatedAt?: Date;
  invoiceNumber?: string;
  actions?: {
    canEdit: boolean;
    canCancel: boolean;
    canComplete: boolean;
  };
};

// Admin component types
export type LeadsTableProps = {
  leads: any[];
  onEdit: (lead: any) => void;
  onDelete: (id: string) => void;
  onGeneratePaymentLink: (lead: any) => void;
  formatDate: (date: Date) => string;
};

export type PaymentLinkModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lead: any | null;
};

export type LeadFormProps = {
  lead?: any;
  onSave: (lead: any) => void;
  onCancel: () => void;
  isLoading: boolean;
};

// Calendar component types
export type CalendarGridProps = {
  currentMonth: Date;
  events: any[];
  onMonthChange: (direction: 'prev' | 'next') => void;
  onMonthSet?: (date: Date) => void;
  onEventClick: (event: any) => void;
};

export type EventFormProps = {
  isOpen: boolean;
  editingEvent: any | null;
  form: any;
  formError: string | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTypeChange: (value: string) => void;
  onTimeChange: (field: 'startTime' | 'endTime', value: string) => void;
  onDateChange: (date: Date | undefined) => void;
};

export type TimeOption = {
  value: string;
  display: string;
};

export type UpcomingEventsProps = {
  events: any[];
  onEventClick: (event: any) => void;
  limit?: number;
};

// Dashboard component types
export type DashboardStatsProps = {
  stats: {
    totalLeads: number;
    totalRevenue: number;
    pendingPayments: number;
    completedPayments: number;
  };
};

export type DashboardChartsProps = {
  revenueData: any[];
  leadsData: any[];
  paymentsData: any[];
};

// Testimonial component types
export type TestimonialsTableProps = {
  testimonials: any[];
  onEdit: (testimonial: any) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
};

export type TestimonialFormProps = {
  testimonial?: any;
  onSave: (testimonial: any) => void;
  onCancel: () => void;
  isLoading: boolean;
};

// UI component types
export type DatePickerProps = {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  disabledDates?: (date: Date) => boolean;
};

export type MonthPickerProps = {
  date: Date;
  onDateChange: (date: Date) => void;
  className?: string;
};

export type PasswordStrengthProps = {
  password: string;
  className?: string;
};

export type ResponsiveTableProps = {
  data: any[];
  columns: any[];
  onRowClick?: (row: any) => void;
  isLoading?: boolean;
  emptyMessage?: string;
};

export type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

// Search component types
export type LeadsSearchProps = {
  onSearch: (query: string) => void;
  onFilter: (filter: string) => void;
  isLoading: boolean;
};

export type TestimonialsSearchProps = {
  onSearch: (query: string) => void;
  onFilter: (filter: string) => void;
  isLoading: boolean;
};

// Header component types
export type CalendarHeaderProps = {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
};

export type LeadsHeaderProps = {
  onAddLead: () => void;
  onRefresh: () => void;
  isLoading: boolean;
};

export type TestimonialsHeaderProps = {
  onAddTestimonial: () => void;
  onRefresh: () => void;
  isLoading: boolean;
};

// Layout component types
export type ResponsiveAdminLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

// Modal component types
export type ResourceDownloadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  resource: any;
  onDownload: (resource: any) => void;
};

// Team member component types
export type TeamMemberProps = {
  name: string;
  title: string;
  bio: string;
  image: string | any;
  achievements: string[];
  achievementsBold?: boolean;
  reverseLayout?: boolean;
};

// Error component types
export type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// Audit component types
export type AuditLogsState = {
  logs: any[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalLogs: number;
  searchTerm: string;
  entityTypeFilter: string;
  actionFilter: string;
  error: string | null;
};
