'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  Trash2, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useCalendlyConfig } from '@/lib/hooks/useCalendlyConfig';
import { CalendlyConfigService } from '@/lib/services/CalendlyConfigService';

/**
 * Form component for managing Calendly configuration
 * Allows admins to set and update the Calendly booking URL
 */
export default function CalendlyConfigForm() {
  const [configState, configActions] = useCalendlyConfig();
  const [formData, setFormData] = useState({
    bookingUrl: '',
    isActive: true,
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const service = CalendlyConfigService.getInstance();

  // Update form data when config is loaded
  React.useEffect(() => {
    if (configState.config) {
      setFormData({
        bookingUrl: configState.config.bookingUrl,
        isActive: configState.config.isActive,
      });
    }
  }, [configState.config]);

  /**
   * Handle form input changes
   */
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationError(null);
  };

  /**
   * Validate the form data
   */
  const validateForm = (): boolean => {
    if (!formData.bookingUrl.trim()) {
      setValidationError('Booking URL is required');
      return false;
    }

    const validation = service.validateCalendlyUrl(formData.bookingUrl);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid URL');
      return false;
    }

    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const success = await configActions.updateConfig({
      bookingUrl: formData.bookingUrl.trim(),
      isActive: formData.isActive,
    });

    if (success) {
      // Form data will be updated automatically via the hook
      setValidationError(null);
    }
  };

  /**
   * Handle delete configuration
   */
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete the Calendly configuration? This will disable all Book Now buttons.')) {
      return;
    }

    const success = await configActions.deleteConfig();
    if (success) {
      setFormData({
        bookingUrl: '',
        isActive: true,
      });
      setValidationError(null);
    }
  };

  /**
   * Handle refresh configuration
   */
  const handleRefresh = async () => {
    await configActions.refreshConfig();
  };

  /**
   * Open the booking URL in a new tab
   */
  const openBookingUrl = () => {
    if (formData.bookingUrl) {
      window.open(formData.bookingUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Calendly Configuration
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={configState.isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${configState.isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Alert */}
        {configState.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {configState.error}
              <Button
                variant="link"
                size="sm"
                onClick={configActions.clearError}
                className="ml-2 p-0 h-auto"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {configState.config && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Calendly configuration is active and ready for use.
            </AlertDescription>
          </Alert>
        )}

        {/* Configuration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bookingUrl">Calendly Booking URL</Label>
            <div className="flex gap-2">
              <Input
                id="bookingUrl"
                type="url"
                placeholder="https://calendly.com/your-username/meeting-type"
                value={formData.bookingUrl}
                onChange={(e) => handleInputChange('bookingUrl', e.target.value)}
                disabled={configState.isUpdating}
                className="flex-1"
              />
              {formData.bookingUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openBookingUrl}
                  disabled={configState.isUpdating}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Enter your Calendly booking link. This URL will be used by all "Book Now" buttons throughout the site.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked === true)}
              disabled={configState.isUpdating}
            />
            <Label htmlFor="isActive" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Enable Calendly booking
            </Label>
          </div>

          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={configState.isUpdating || !formData.bookingUrl.trim()}
              className="flex items-center gap-2"
            >
              {configState.isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {configState.config ? 'Update Configuration' : 'Save Configuration'}
            </Button>

            {configState.config && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={configState.isUpdating}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </form>

        {/* Configuration Info */}
        {configState.config && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm text-gray-900 mb-2">Current Configuration</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Status:</strong> {configState.config.isActive ? 'Active' : 'Inactive'}</p>
              <p><strong>URL:</strong> {configState.config.bookingUrl}</p>
              <p><strong>Last Updated:</strong> {new Date(configState.config.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
