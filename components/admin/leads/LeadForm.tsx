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
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import type { LeadFormData, FieldErrors, PasswordValidation } from '@/lib/hooks/useLeads';

interface LeadFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: LeadFormData;
  fieldErrors: FieldErrors;
  passwordValidation: PasswordValidation;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  isEdit: boolean;
}

/**
 * Form component for adding and editing leads
 * Handles form inputs, validation, and submission
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
  const getFieldError = (fieldName: string) => fieldErrors[fieldName as keyof FieldErrors];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the lead details below.' : 'Enter the lead details below.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
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
        <DialogFooter>
          <Button type="submit" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Lead' : 'Add Lead')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 