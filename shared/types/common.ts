/**
 * Common utility types for the leadership coaching platform
 */

export type PaginationParams = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type FilterParams = {
  search?: string;
  status?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type TableColumn<T> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
};

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type FormField = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'file' | 'date' | 'number';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
};

export type Notification = {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
};

export type Breadcrumb = {
  label: string;
  href?: string;
  active?: boolean;
};

export type MenuItem = {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: MenuItem[];
}; 