/**
 * Backend authentication types for API routes
 */

export type AuthResult = {
  user: {
    uid: string;
    email: string;
    role?: string;
  } | null;
  error?: string;
};

export type UserProfile = {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  organization?: string;
  role: 'admin' | 'user';
  isActive: boolean;
  displayName: string;
  createdAt: Date;
  lastLoginAt?: Date;
  updatedAt: Date;
}; 