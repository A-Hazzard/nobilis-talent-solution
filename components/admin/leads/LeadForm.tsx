'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { LeadFormData, FieldErrors, PasswordValidation } from '@/lib/types/hooks';

interface LeadFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: LeadFormData;
  fieldErrors: FieldErrors;
  passwordValidation: PasswordValidation;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  isEdit: boolean;
}

/**
 * Form component for adding and editing leads
 * Handles form inputs, validation, and submission with 2-step process
 */
export function LeadForm({
  isOpen,
  onOpenChange,
  formData,
  fieldErrors,
  passwordValidation,
  showPassword,
  showConfirmPassword,
  onInputChange,
  setShowPassword,
  setShowConfirmPassword,
  onSubmit,
  isSubmitting,
  isEdit,
}: LeadFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const getFieldError = (fieldName: string) => fieldErrors[fieldName as keyof FieldErrors];

  const handleClose = () => {
    setCurrentStep(1);
    onOpenChange(false);
  };

  const nextStep = () => {
    setCurrentStep(2);
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const canProceedToStep2 = () => {
    return formData.firstName && formData.lastName && formData.email && 
           (isEdit || (formData.password && formData.confirmPassword));
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={onInputChange}
            className={getFieldError('firstName') ? 'border-red-500' : ''}
          />
          {getFieldError('firstName') && (
            <p className="text-sm text-red-500 mt-1">{getFieldError('firstName')}</p>
          )}
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={onInputChange}
            className={getFieldError('lastName') ? 'border-red-500' : ''}
          />
          {getFieldError('lastName') && (
            <p className="text-sm text-red-500 mt-1">{getFieldError('lastName')}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={onInputChange}
          className={getFieldError('email') ? 'border-red-500' : ''}
        />
        {getFieldError('email') && (
          <p className="text-sm text-red-500 mt-1">{getFieldError('email')}</p>
        )}
      </div>

      {!isEdit && (
        <>
          <div>
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={onInputChange}
                className={getFieldError('password') ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {getFieldError('password') && (
              <p className="text-sm text-red-500 mt-1">{getFieldError('password')}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={onInputChange}
                className={getFieldError('confirmPassword') ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {getFieldError('confirmPassword') && (
              <p className="text-sm text-red-500 mt-1">{getFieldError('confirmPassword')}</p>
            )}
          </div>

          {/* Password Validation */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Password Requirements:</p>
                <div className="text-sm space-y-1">
                  <div className={`flex items-center gap-2 ${passwordValidation.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{passwordValidation.hasMinLength ? '✓' : '○'}</span>
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-2 ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{passwordValidation.hasUppercase ? '✓' : '○'}</span>
                    <span>One uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-2 ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{passwordValidation.hasSpecialChar ? '✓' : '○'}</span>
                    <span>One special character</span>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </>
      )}

      <div>
        <Label htmlFor="organization">Organization</Label>
        <Input
          id="organization"
          name="organization"
          value={formData.organization}
          onChange={onInputChange}
          className={getFieldError('organization') ? 'border-red-500' : ''}
        />
        {getFieldError('organization') && (
          <p className="text-sm text-red-500 mt-1">{getFieldError('organization')}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={onInputChange}
          className={getFieldError('phone') ? 'border-red-500' : ''}
        />
        {getFieldError('phone') && (
          <p className="text-sm text-red-500 mt-1">{getFieldError('phone')}</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="jobTitle">Job Title</Label>
        <Input
          id="jobTitle"
          name="jobTitle"
          value={formData.jobTitle || ''}
          onChange={onInputChange}
          placeholder="e.g., CEO, Manager, Director"
        />
      </div>

      <div>
        <Label htmlFor="organizationType">Organization Type</Label>
        <select
          id="organizationType"
          name="organizationType"
          value={formData.organizationType || ''}
          onChange={onInputChange}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
        >
          <option value="">Select organization type</option>
          <option value="startup">Startup</option>
          <option value="small-business">Small Business</option>
          <option value="enterprise">Enterprise</option>
          <option value="nonprofit">Nonprofit</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <Label htmlFor="industryFocus">Industry Focus</Label>
        <Input
          id="industryFocus"
          name="industryFocus"
          value={formData.industryFocus || ''}
          onChange={onInputChange}
          placeholder="e.g., Technology, Healthcare, Finance"
        />
      </div>

      <div>
        <Label htmlFor="teamSize">Team Size</Label>
        <select
          id="teamSize"
          name="teamSize"
          value={formData.teamSize || ''}
          onChange={onInputChange}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
        >
          <option value="">Select team size</option>
          <option value="1-10">1-10 employees</option>
          <option value="11-50">11-50 employees</option>
          <option value="51-200">51-200 employees</option>
          <option value="201-1000">201-1000 employees</option>
          <option value="1000+">1000+ employees</option>
        </select>
      </div>

      <div>
        <Label htmlFor="primaryGoals">Primary Goals (comma-separated)</Label>
        <Input
          id="primaryGoals"
          name="primaryGoals"
          value={Array.isArray(formData.primaryGoals) ? formData.primaryGoals.join(', ') : ''}
          onChange={onInputChange}
          placeholder="e.g., Leadership Development, Team Building, Strategic Planning"
        />
      </div>

      <div>
        <Label htmlFor="challengesDescription">Challenges Description</Label>
        <textarea
          id="challengesDescription"
          name="challengesDescription"
          value={formData.challengesDescription || ''}
          onChange={onInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground resize-none"
          placeholder="Describe the main challenges you're facing..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="timeline">Timeline</Label>
          <select
            id="timeline"
            name="timeline"
            value={formData.timeline || ''}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="">Select timeline</option>
            <option value="immediate">Immediate (within 1 month)</option>
            <option value="short-term">Short-term (1-3 months)</option>
            <option value="medium-term">Medium-term (3-6 months)</option>
            <option value="long-term">Long-term (6+ months)</option>
          </select>
        </div>

        <div>
          <Label htmlFor="budget">Budget Range</Label>
          <select
            id="budget"
            name="budget"
            value={formData.budget || ''}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="">Select budget range</option>
            <option value="under-5k">Under $5,000</option>
            <option value="5k-15k">$5,000 - $15,000</option>
            <option value="15k-50k">$15,000 - $50,000</option>
            <option value="50k-100k">$50,000 - $100,000</option>
            <option value="100k+">$100,000+</option>
            <option value="to-be-discussed">To be discussed</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {isEdit ? 'Edit Lead' : 'Add New Lead'} - Step {currentStep} of 2
          </DialogTitle>
          <DialogDescription className="text-sm">
            {currentStep === 1 
              ? (isEdit ? 'Update the basic lead information.' : 'Enter the basic lead information.')
              : 'Provide additional onboarding details.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {currentStep === 1 ? renderStep1() : renderStep2()}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2">
          <div className="flex gap-2 order-2 sm:order-1">
            {currentStep === 2 && (
              <Button variant="outline" onClick={prevStep} disabled={isSubmitting} className="w-full sm:w-auto">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex gap-2 order-1 sm:order-2">
            {currentStep === 1 ? (
              <Button 
                onClick={nextStep} 
                disabled={!canProceedToStep2() || isSubmitting}
                className="flex items-center w-full sm:w-auto"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                onClick={onSubmit} 
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Lead' : 'Add Lead')}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 