'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Users } from 'lucide-react';
import { useLeads } from '@/lib/hooks/useLeads';
import { LeadsHeader } from '@/components/admin/leads/LeadsHeader';
import { LeadsSearch } from '@/components/admin/leads/LeadsSearch';
import { LeadsTable } from '@/components/admin/leads/LeadsTable';
import { LeadForm } from '@/components/admin/leads/LeadForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

/**
 * Leads admin page component
 * Uses custom hook for state management and displays leads in a table
 */
export default function LeadsPage() {
  const [state, actions] = useLeads();
  const {
    leads,
    isLoading,
    searchTerm,
    error,
    isAddDialogOpen,
    isEditDialogOpen,
    isSubmitting,
    showPassword,
    showConfirmPassword,
    fieldErrors,
    passwordValidation,
    formData,
  } = state;

  const {
    handleAddLead,
    handleEditLead,
    handleDeleteLead,
    openEditDialog,
    handleInputChange,
    setSearchTerm,
    setIsAddDialogOpen,
    setIsEditDialogOpen,
    setShowPassword,
    setShowConfirmPassword,
    formatDate,
  } = actions;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={`loading-skeleton-${i}`} className="flex items-center space-x-4 animate-pulse">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <LeadsHeader 
        setIsAddDialogOpen={setIsAddDialogOpen}
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <LeadsSearch 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* No Data State */}
      {!isLoading && !error && leads.length === 0 && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first lead.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Lead
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leads Table */}
      {!isLoading && !error && leads.length > 0 && (
        <LeadsTable
          leads={leads}
          onEdit={openEditDialog}
          onDelete={handleDeleteLead}
          formatDate={formatDate}
        />
      )}

      {/* Add Dialog */}
      <LeadForm
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        fieldErrors={fieldErrors}
        passwordValidation={passwordValidation}
        showPassword={showPassword}
        showConfirmPassword={showConfirmPassword}
        onInputChange={handleInputChange}
        setShowPassword={setShowPassword}
        setShowConfirmPassword={setShowConfirmPassword}
        onSubmit={handleAddLead}
        isSubmitting={isSubmitting}
        isEdit={false}
      />

      {/* Edit Dialog */}
      <LeadForm
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        fieldErrors={fieldErrors}
        passwordValidation={passwordValidation}
        showPassword={showPassword}
        showConfirmPassword={showConfirmPassword}
        onInputChange={handleInputChange}
        setShowPassword={setShowPassword}
        setShowConfirmPassword={setShowConfirmPassword}
        onSubmit={handleEditLead}
        isSubmitting={isSubmitting}
        isEdit={true}
      />
    </div>
  );
} 