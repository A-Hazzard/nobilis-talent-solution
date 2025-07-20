'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, Chrome } from 'lucide-react';

type KindeConfig = {
  clientId: string;
  issuerUrl: string;
  siteUrl: string;
};

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kindeConfig, setKindeConfig] = useState<KindeConfig | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/auth/config');
        if (response.ok) {
          const config = await response.json();
          setKindeConfig(config);
        }
      } catch (error) {
        console.error('Error fetching Kinde config:', error);
      }
    };
    fetchConfig();
  }, []);

  const handleGoogleSignUp = async () => {
    if (!kindeConfig) {
      setError('Configuration not loaded. Please try again.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const state = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const params = new URLSearchParams({
        client_id: kindeConfig.clientId,
        redirect_uri: `${kindeConfig.siteUrl}/api/auth/kinde`,
        response_type: 'code',
        scope: 'openid profile email',
        state,
        prompt: 'select_account',
      });

      const authUrl = `${kindeConfig.issuerUrl}/oauth2/auth?${params.toString()}`;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Google sign-up error:', error);
      setError('Failed to initiate Google sign-up. Please try again.');
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kindeConfig) {
      setError('Configuration not loaded. Please try again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const state = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const params = new URLSearchParams({
        client_id: kindeConfig.clientId,
        redirect_uri: `${kindeConfig.siteUrl}/api/auth/kinde`,
        response_type: 'code',
        scope: 'openid profile email',
        state,
        login_hint: formData.email,
      });

      const authUrl = `${kindeConfig.issuerUrl}/oauth2/auth?${params.toString()}`;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Email sign-up error:', error);
      setError('Failed to sign up. Please try again.');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create Account
          </CardTitle>
          <CardDescription className="text-center">
            Sign up to get started with your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Google Sign Up */}
          <Button
            onClick={handleGoogleSignUp}
            disabled={isLoading || !kindeConfig}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : !kindeConfig ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Chrome className="mr-2 h-4 w-4" />
            )}
            {!kindeConfig ? 'Loading...' : 'Continue with Google'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="pl-10"
                  />
                </div>
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
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !kindeConfig}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : !kindeConfig ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Create Account'
              )}
              {!kindeConfig ? 'Loading...' : (isLoading ? 'Creating Account...' : 'Create Account')}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <a
              href="/login"
              className="text-primary hover:underline"
            >
              Sign in
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 