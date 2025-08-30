'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Building2, 
  Target, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Users,
  Briefcase,
  Star,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type OnboardingStep = 'welcome' | 'profile' | 'organization' | 'goals' | 'complete';

type OnboardingData = {
  // Profile step
  firstName: string;
  lastName: string;
  jobTitle: string;
  phone: string;
  
  // Organization step
  organizationName: string;
  organizationType: 'startup' | 'small-business' | 'enterprise' | 'nonprofit' | 'other';
  industryFocus: string;
  teamSize: string;
  
  // Goals step
  primaryGoals: string[];
  challengesDescription: string;
  timeline: string;
  budget: string;
};

const ORGANIZATION_TYPES = [
  { value: 'startup', label: 'Startup' },
  { value: 'small-business', label: 'Small Business' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'nonprofit', label: 'Non-Profit' },
  { value: 'other', label: 'Other' }
];

const GOAL_OPTIONS = [
  'Leadership Development',
  'Team Building',
  'Strategic Planning',
  'Communication Skills',
  'Change Management',
  'Performance Improvement',
  'Executive Coaching',
  'Organizational Culture'
];

const TEAM_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-1000 employees',
  '1000+ employees'
];

const BUDGET_RANGES = [
  'Under $5,000',
  '$5,000 - $15,000',
  '$15,000 - $50,000',
  '$50,000 - $100,000',
  'Over $100,000'
];

const TIMELINES = [
  'Immediate (within 1 month)',
  'Short-term (1-3 months)',
  'Medium-term (3-6 months)',
  'Long-term (6+ months)'
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    jobTitle: '',
    phone: '',
    organizationName: '',
    organizationType: 'small-business',
    industryFocus: '',
    teamSize: '',
    primaryGoals: [],
    challengesDescription: '',
    timeline: '',
    budget: ''
  });

  // Check if user is authenticated and redirect if already onboarded
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      // Check if user has already completed onboarding
      if (user?.onboardingCompleted) {
        router.push('/');
        return;
      }
      
      // Pre-fill user data if available
      if (user) {
        setData(prev => ({
          ...prev,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          jobTitle: user.jobTitle || '',
          phone: user.phone || '',
          organizationName: user.organization || '',
          organizationType: user.organizationType || 'small-business',
          industryFocus: user.industryFocus || '',
          teamSize: user.teamSize || '',
          primaryGoals: user.primaryGoals || [],
          challengesDescription: user.challengesDescription || '',
          timeline: user.timeline || '',
          budget: user.budget || '',
        }));
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const getStepNumber = (step: OnboardingStep): number => {
    const steps = ['welcome', 'profile', 'organization', 'goals', 'complete'];
    return steps.indexOf(step) + 1;
  };

  const getProgress = (): number => {
    const totalSteps = 5;
    const currentStepNumber = getStepNumber(currentStep);
    return (currentStepNumber / totalSteps) * 100;
  };

  const nextStep = () => {
    const steps: OnboardingStep[] = ['welcome', 'profile', 'organization', 'goals', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: OnboardingStep[] = ['welcome', 'profile', 'organization', 'goals', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const toggleGoal = (goal: string) => {
    setData(prev => ({
      ...prev,
      primaryGoals: prev.primaryGoals.includes(goal)
        ? prev.primaryGoals.filter(g => g !== goal)
        : [...prev.primaryGoals, goal]
    }));
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Include Firebase ID token so the API can authenticate you
      const idToken = await (await import('firebase/auth')).getIdToken?.(await (await import('firebase/auth')).getAuth().currentUser!);
      const response = await fetch('/api/auth/complete-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Welcome! Your onboarding is complete.');
        router.push('/');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Onboarding completion error:', error);
      toast.error('Failed to complete onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  const _handleSkip = async () => {
    // Mark onboarding completed without extra fields
    setIsSubmitting(true);
    try {
      const idToken = await (await import('firebase/auth')).getIdToken?.(await (await import('firebase/auth')).getAuth().currentUser!);
      const response = await fetch('/api/auth/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) },
        body: JSON.stringify({
          firstName: data.firstName || user?.firstName || '',
          lastName: data.lastName || user?.lastName || '',
          organizationName: data.organizationName || 'Not specified',
          organizationType: data.organizationType || 'other',
          jobTitle: data.jobTitle || '',
          phone: data.phone || '',
          industryFocus: '',
          teamSize: '',
          primaryGoals: ['unspecified'],
          challengesDescription: '',
          timeline: '',
          budget: '',
        }),
      });
      if (response.ok) {
        router.push('/');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to skip onboarding');
      }
    } catch {
      toast.error('Failed to skip onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderWelcomeStep = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-3xl font-bold">Welcome to Payne Leadership!</CardTitle>
        <CardDescription className="text-lg">
          Let's get you set up for success. This quick setup will help us personalize your experience.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <User className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold">Profile Setup</h3>
            <p className="text-sm text-gray-600">Tell us about yourself</p>
          </div>
          <div className="text-center p-4">
            <Building2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold">Organization Info</h3>
            <p className="text-sm text-gray-600">Share your company details</p>
          </div>
          <div className="text-center p-4">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold">Goals & Objectives</h3>
            <p className="text-sm text-gray-600">Define your leadership goals</p>
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <Button onClick={nextStep} size="lg">
            Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          {/* <Button variant="outline" size="lg" onClick={handleSkip}>
            Skip for now
          </Button> */}
        </div>
      </CardContent>
    </Card>
  );

  const renderProfileStep = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Tell us about yourself
        </CardTitle>
        <CardDescription>
          This information helps us personalize your experience and connect you with relevant resources.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={data.firstName}
              onChange={(e) => setData(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="Enter your first name"
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={data.lastName}
              onChange={(e) => setData(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Enter your last name"
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input
            id="jobTitle"
            value={data.jobTitle}
            onChange={(e) => setData(prev => ({ ...prev, jobTitle: e.target.value }))}
            placeholder="e.g., CEO, Team Lead, Director"
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => setData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={prevStep}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={nextStep}
            disabled={!data.firstName || !data.lastName}
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderOrganizationStep = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Organization Information
        </CardTitle>
        <CardDescription>
          Help us understand your organization so we can provide tailored recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="organizationName">Organization Name *</Label>
          <Input
            id="organizationName"
            value={data.organizationName}
            onChange={(e) => setData(prev => ({ ...prev, organizationName: e.target.value }))}
            placeholder="Enter your organization name"
            required
          />
        </div>

        <div>
          <Label>Organization Type</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {ORGANIZATION_TYPES.map((type) => (
              <Button
                key={type.value}
                variant={data.organizationType === type.value ? "default" : "outline"}
                size="sm"
                onClick={() => setData(prev => ({ ...prev, organizationType: type.value as any }))}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="industryFocus">Industry Focus</Label>
          <Input
            id="industryFocus"
            value={data.industryFocus}
            onChange={(e) => setData(prev => ({ ...prev, industryFocus: e.target.value }))}
            placeholder="e.g., Technology, Healthcare, Finance"
          />
        </div>

        <div>
          <Label>Team Size</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {TEAM_SIZES.map((size) => (
              <Button
                key={size}
                variant={data.teamSize === size ? "default" : "outline"}
                size="sm"
                onClick={() => setData(prev => ({ ...prev, teamSize: size }))}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={prevStep}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={nextStep}
            disabled={!data.organizationName}
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderGoalsStep = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Goals & Objectives
        </CardTitle>
        <CardDescription>
          Define your leadership development goals to help us create a personalized experience.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Primary Goals (Select all that apply)</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {GOAL_OPTIONS.map((goal) => (
              <Badge
                key={goal}
                variant={data.primaryGoals.includes(goal) ? "default" : "outline"}
                className="cursor-pointer p-2 justify-center hover:bg-primary/10"
                onClick={() => toggleGoal(goal)}
              >
                {goal}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="challengesDescription">Current Challenges</Label>
          <Textarea
            id="challengesDescription"
            value={data.challengesDescription}
            onChange={(e) => setData(prev => ({ ...prev, challengesDescription: e.target.value }))}
            placeholder="Describe your current leadership challenges or areas you'd like to improve..."
            rows={3}
          />
        </div>

        <div>
          <Label>Timeline</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {TIMELINES.map((timeline) => (
              <Button
                key={timeline}
                variant={data.timeline === timeline ? "default" : "outline"}
                size="sm"
                onClick={() => setData(prev => ({ ...prev, timeline: timeline }))}
              >
                {timeline}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label>Budget Range</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {BUDGET_RANGES.map((budget) => (
              <Button
                key={budget}
                variant={data.budget === budget ? "default" : "outline"}
                size="sm"
                onClick={() => setData(prev => ({ ...prev, budget: budget }))}
              >
                {budget}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={prevStep}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={nextStep}
            disabled={data.primaryGoals.length === 0}
          >
            Complete Setup
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCompleteStep = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-3xl font-bold">Setup Complete!</CardTitle>
        <CardDescription className="text-lg">
          Thank you for providing your information. We're excited to help you on your leadership journey.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">What's Next?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Explore Resources</p>
                <p className="text-sm text-gray-600">Browse our leadership resources and tools</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Schedule a Consultation</p>
                <p className="text-sm text-gray-600">Book a personalized consultation session</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Access Premium Content</p>
                <p className="text-sm text-gray-600">Get tailored recommendations based on your goals</p>
              </div>
            </div>
          </div>
        </div>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            We'll send you a welcome email with next steps and resources tailored to your goals.
          </AlertDescription>
        </Alert>

        <div className="flex justify-center pt-4">
          <Button 
            onClick={handleComplete}
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? 'Completing...' : 'Enter Platform'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">Getting Started</h1>
            <span className="text-sm text-gray-600">
              Step {getStepNumber(currentStep)} of 5
            </span>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        {/* Step Content */}
        {currentStep === 'welcome' && renderWelcomeStep()}
        {currentStep === 'profile' && renderProfileStep()}
        {currentStep === 'organization' && renderOrganizationStep()}
        {currentStep === 'goals' && renderGoalsStep()}
        {currentStep === 'complete' && renderCompleteStep()}
      </div>
    </div>
  );
}