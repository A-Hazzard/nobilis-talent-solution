'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Users } from 'lucide-react';
import { useTestimonials } from '@/lib/hooks/useTestimonials';
import { TestimonialsHeader } from '@/components/admin/testimonials/TestimonialsHeader';
import { TestimonialsSearch } from '@/components/admin/testimonials/TestimonialsSearch';
import { TestimonialsTable } from '@/components/admin/testimonials/TestimonialsTable';
import { TestimonialForm } from '@/components/admin/testimonials/TestimonialForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// Force dynamic rendering to prevent pre-rendering issues
export const dynamic = 'force-dynamic';

/**
 * Testimonials admin page component
 * Uses custom hook for state management and displays testimonials in a table
 */
export default function TestimonialsPage() {
  const [state, actions] = useTestimonials();
  const {
    testimonials,
    isLoading,
    searchTerm,
    error,
    isAddDialogOpen,
    isEditDialogOpen,
    formData,
    isSubmitting,
  } = state;

  const {
    handleAddTestimonial,
    handleEditTestimonial,
    handleDeleteTestimonial,
    openEditDialog,
    setSearchTerm,
    setIsAddDialogOpen,
    setIsEditDialogOpen,
    setFormData,
    getStatusBadge,
    renderStars,
    formatDate,
  } = actions;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Testimonial
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
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
      <TestimonialsHeader 
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
      <TestimonialsSearch 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* No Data State */}
      {!isLoading && !error && testimonials.length === 0 && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No testimonials found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first testimonial.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Testimonial
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testimonials Table */}
      {!isLoading && !error && testimonials.length > 0 && (
        <TestimonialsTable
          testimonials={testimonials}
          onEdit={openEditDialog}
          onDelete={handleDeleteTestimonial}
          getStatusBadge={getStatusBadge}
          renderStars={renderStars}
          formatDate={formatDate}
        />
      )}

      {/* Add Dialog */}
      <TestimonialForm
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddTestimonial}
        isSubmitting={isSubmitting}
        isEdit={false}
      />

      {/* Edit Dialog */}
      <TestimonialForm
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditTestimonial}
        isSubmitting={isSubmitting}
        isEdit={true}
      />
    </div>
  );
} 