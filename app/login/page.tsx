'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, X, Eye, EyeOff } from 'lucide-react';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { validateLoginForm } from '@/lib/utils/validation';
import { getRedirectPath } from '@/lib/utils/authUtils';

// Force dynamic rendering to prevent pre-rendering issues
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      console.log('LoginPage: User already authenticated, redirecting based on role...');
      console.log('LoginPage: User details:', user);
      console.log('LoginPage: Current pathname:', window.location.pathname);
      
      const redirectPath = getRedirectPath(user);
      console.log('LoginPage: Executing redirect to', redirectPath);
      router.push(redirectPath);
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);

    // Clear field-specific error when user starts typing
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Real-time validation
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        setFieldErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      } else {
        setFieldErrors(prev => ({ ...prev, email: undefined }));
      }
    }

    if (name === 'password') {
      if (value && value.length < 8) {
        setFieldErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }));
      } else {
        setFieldErrors(prev => ({ ...prev, password: undefined }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate form
    const validation = validateLoginForm(formData.email, formData.password);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setIsLoading(false);
      return;
    }

    try {
      console.log('LoginPage: Attempting to sign in...');
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        console.log('LoginPage: Sign in error:', error);
        setError(error.message);
      } else {
        console.log('LoginPage: Sign in successful, waiting for auth state update...');
        // The redirect will happen automatically via useEffect when auth state updates
      }
    } catch (error) {
      console.error('LoginPage: Email sign-in error:', error);
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (fieldName: string) => {
    return fieldErrors[fieldName as keyof typeof fieldErrors];
  };

  const isFieldValid = (fieldName: string) => {
    return !getFieldError(fieldName) && formData[fieldName as keyof typeof formData]?.trim() !== '';
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <X className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`pl-10 ${isFieldValid('email') ? 'border-green-500' : getFieldError('email') ? 'border-red-500' : ''}`}
                />
                {isFieldValid('email') && (
                  <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
              </div>
              {getFieldError('email') && (
                <p className="text-sm text-red-500">{getFieldError('email')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={`pl-10 pr-10 ${isFieldValid('password') ? 'border-green-500' : getFieldError('password') ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {getFieldError('password') && (
                <p className="text-sm text-red-500">{getFieldError('password')}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-600 hover:text-blue-500">
              Create account
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 