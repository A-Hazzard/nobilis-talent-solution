'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, X, Eye, EyeOff } from 'lucide-react';
import { Mail, Lock, Chrome } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { validateLoginForm } from '@/lib/utils/validation';
import { getRedirectPath } from '@/lib/utils/authUtils';

// Force dynamic rendering to prevent pre-rendering issues
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      console.log('LoginPage: User already authenticated, redirecting based on role...');
      console.log('LoginPage: User details:', user);
      console.log('LoginPage: Current pathname:', window.location.pathname);
      
      const redirectPath = getRedirectPath(user, true); // true = login flow
      console.log('LoginPage: Executing redirect to', redirectPath);
      router.push(redirectPath);
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
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

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      rememberMe: checked 
    }));
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
    const value = formData[fieldName as keyof typeof formData];
    return !getFieldError(fieldName) && typeof value === 'string' && value.trim() !== '';
  };

  const handleGoogleSignIn = async () => {
    setSocialLoading('google');
    setError(null);
    
    try {
      console.log('LoginPage: Attempting Google sign-in...');
      const { error, isNewUser } = await signInWithGoogle();
      if (error) {
        console.log('LoginPage: Google sign-in error:', error);
        setError(error.message);
      } else {
        console.log('LoginPage: Google sign-in successful, isNewUser:', isNewUser);
        // The redirect will happen automatically via useEffect when auth state updates
      }
    } catch (error) {
      console.error('LoginPage: Google sign-in error:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setSocialLoading(null);
    }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <Card className="w-full max-w-md relative z-10 backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            Sign in to your account to continue
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

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={handleCheckboxChange}
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 transition-colors">
                Forgot password?
              </a>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:opacity-50" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Social Login Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="mx-4 text-sm text-gray-500 bg-white px-2">Or continue with</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Social Login Buttons */}
          <div>
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={socialLoading !== null || isLoading}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md disabled:transform-none disabled:opacity-50"
            >
              {socialLoading === 'google' ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Chrome className="h-5 w-5 mr-3 text-blue-600" />
                  Continue with Google
                </div>
              )}
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
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