'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, X, Eye, EyeOff, User, Mail, Lock, Building, UserCheck, Phone, Chrome } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { validateSignupForm } from '@/lib/utils/validation';
import { getRedirectPath } from '@/lib/utils/authUtils';
import { PasswordStrength } from '@/components/ui/password-strength';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import TermsOfServiceModal from '@/components/TermsOfServiceModal';

// Force dynamic rendering to prevent pre-rendering issues
export const dynamic = 'force-dynamic';

export default function SignupPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle, user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    organization?: string;
    phone?: string;
    privacyPolicy?: string;
    termsOfService?: string;
  }>({});
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);


  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    organization: '',
    phone: ''
  });

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      console.log('SignupPage: User already authenticated, redirecting based on role...');
      console.log('SignupPage: User details:', user);
      console.log('SignupPage: Current pathname:', window.location.pathname);
      
      const redirectPath = getRedirectPath(user, false); // false = signup flow
      console.log('SignupPage: Executing redirect to', redirectPath);
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



    // Real-time validation for other fields
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        setFieldErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      } else {
        setFieldErrors(prev => ({ ...prev, email: undefined }));
      }
    }

    if (name === 'firstName' || name === 'lastName') {
      const fieldName = name === 'firstName' ? 'First name' : 'Last name';
      if (value && value.trim().length < 3) {
        setFieldErrors(prev => ({ ...prev, [name]: `${fieldName} must be at least 3 characters long` }));
      } else {
        setFieldErrors(prev => ({ ...prev, [name]: undefined }));
      }
    }

    if (name === 'organization' && value) {
      if (value.trim().length < 3) {
        setFieldErrors(prev => ({ ...prev, organization: 'Organization must be at least 3 characters long' }));
      } else {
        setFieldErrors(prev => ({ ...prev, organization: undefined }));
      }
    }

    if (name === 'phone' && value) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
        setFieldErrors(prev => ({ ...prev, phone: 'Please enter a valid phone number' }));
      } else {
        setFieldErrors(prev => ({ ...prev, phone: undefined }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Check privacy policy acceptance
    if (!privacyAccepted) {
      setFieldErrors(prev => ({ ...prev, privacyPolicy: 'You must accept the Privacy Policy to continue' }));
      setIsLoading(false);
      return;
    }

    // Check terms of service acceptance
    if (!termsAccepted) {
      setFieldErrors(prev => ({ ...prev, termsOfService: 'You must accept the Terms of Service to continue' }));
      setIsLoading(false);
      return;
    }

    // Validate form
    const validation = validateSignupForm(formData);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setIsLoading(false);
      return;
    }

    try {
      console.log('SignupPage: Attempting to sign up...');
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.organization || 'Not specified',
        formData.phone || ''
      );
      if (error) {
        console.log('SignupPage: Sign up error:', error);
        setError(error.message);
      } else {
        console.log('SignupPage: Sign up successful, waiting for auth state update...');
        // The redirect will happen automatically via useEffect when auth state updates
      }
    } catch (error) {
      console.error('SignupPage: Email sign-up error:', error);
      setError('Failed to sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setSocialLoading('google');
    setError(null);
    try {
      const { error, isNewUser } = await signInWithGoogle();
      if (error) {
        setError(error.message);
      } else if (isNewUser) {
        // New Google users go straight to onboarding
        router.push('/onboarding');
      }
      // Existing users will be redirected via useEffect when auth state updates
    } catch {
      setError('Failed to sign up with Google. Please try again.');
    } finally {
      setSocialLoading(null);
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
            Join Us
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            Create your account to get started
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className={`pl-10 ${isFieldValid('firstName') ? 'border-green-500' : getFieldError('firstName') ? 'border-red-500' : ''}`}
                  />
                  {isFieldValid('firstName') && (
                    <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                  )}
                </div>
                {getFieldError('firstName') && (
                  <p className="text-sm text-red-500">{getFieldError('firstName')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className={`pl-10 ${isFieldValid('lastName') ? 'border-green-500' : getFieldError('lastName') ? 'border-red-500' : ''}`}
                  />
                  {isFieldValid('lastName') && (
                    <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                  )}
                </div>
                {getFieldError('lastName') && (
                  <p className="text-sm text-red-500">{getFieldError('lastName')}</p>
                )}
              </div>
            </div>

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
              <Label htmlFor="organization">Organization (Optional)</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="organization"
                  name="organization"
                  type="text"
                  placeholder="Your organization (optional)"
                  value={formData.organization}
                  onChange={handleInputChange}
                  className={`pl-10 ${formData.organization && isFieldValid('organization') ? 'border-green-500' : getFieldError('organization') ? 'border-red-500' : ''}`}
                />
                {formData.organization && isFieldValid('organization') && (
                  <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
              </div>
              {getFieldError('organization') && (
                <p className="text-sm text-red-500">{getFieldError('organization')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(678) 956-1146"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`pl-10 ${formData.phone && isFieldValid('phone') ? 'border-green-500' : getFieldError('phone') ? 'border-red-500' : ''}`}
                />
                {formData.phone && isFieldValid('phone') && (
                  <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
              </div>
              {getFieldError('phone') && (
                <p className="text-sm text-red-500">{getFieldError('phone')}</p>
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
                  placeholder="Create a password"
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
              
              {/* Password strength indicator */}
              <PasswordStrength password={formData.password} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className={`pl-10 pr-10 ${formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-green-500' : getFieldError('confirmPassword') ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {getFieldError('confirmPassword') && (
                <p className="text-sm text-red-500">{getFieldError('confirmPassword')}</p>
              )}
            </div>

            {/* Privacy Policy Checkbox */}
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="privacy-policy"
                  checked={privacyAccepted}
                  onChange={(e) => {
                    setPrivacyAccepted(e.target.checked);
                    if (e.target.checked) {
                      setFieldErrors(prev => ({ ...prev, privacyPolicy: undefined }));
                    }
                  }}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="privacy-policy" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                  I agree to the{' '}
                  <PrivacyPolicyModal>
                    <button 
                      type="button" 
                      className="text-blue-600 hover:text-blue-500 underline"
                    >
                      Privacy Policy
                    </button>
                  </PrivacyPolicyModal>
                  <span className="text-red-500 ml-1">*</span>
                </label>
              </div>
              {getFieldError('privacyPolicy') && (
                <p className="text-sm text-red-500">{getFieldError('privacyPolicy')}</p>
              )}
            </div>

            {/* Terms of Service Checkbox */}
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms-of-service"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (e.target.checked) {
                      setFieldErrors(prev => ({ ...prev, termsOfService: undefined }));
                    }
                  }}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="terms-of-service" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                  I agree to the{' '}
                  <TermsOfServiceModal>
                    <button 
                      type="button" 
                      className="text-blue-600 hover:text-blue-500 underline"
                    >
                      Terms of Service
                    </button>
                  </TermsOfServiceModal>
                  <span className="text-red-500 ml-1">*</span>
                </label>
              </div>
              {getFieldError('termsOfService') && (
                <p className="text-sm text-red-500">{getFieldError('termsOfService')}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:opacity-50" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Social Signup Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="mx-4 text-sm text-gray-500 bg-white px-2">Or continue with</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Social Signup Buttons */}
          <div>
            <Button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={socialLoading !== null || isLoading}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md disabled:transform-none disabled:opacity-50"
            >
              {socialLoading === 'google' ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Connecting...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Chrome className="h-5 w-5 mr-3 text-blue-600" />
                  Continue with Google
                </div>
              )}
            </Button>
          </div>

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
