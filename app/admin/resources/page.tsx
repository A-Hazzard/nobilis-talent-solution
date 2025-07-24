'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, FileText } from 'lucide-react';
import { useResources } from '@/lib/hooks/useResources';
import { ResourcesHeader } from '@/components/admin/resources/ResourcesHeader';
import { ResourcesSearch } from '@/components/admin/resources/ResourcesSearch';
import { ResourcesGrid } from '@/components/admin/resources/ResourcesGrid';
import { ResourceForm } from '@/components/admin/resources/ResourceForm';
import { ResourcePreview } from '@/components/admin/resources/ResourcePreview';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// Force dynamic rendering to prevent pre-rendering issues
export const dynamic = 'force-dynamic';

/**
 * Resources admin page component
 * Uses custom hook for state management and displays resources in a grid
 */
export default function ResourcesPage() {
  const [state, actions] = useResources();
  const {
    resources,
    isLoading,
    searchTerm,
    error,
    isAddDialogOpen,
    isEditDialogOpen,
    isPreviewDialogOpen,
    previewResource,
    selectedFile,
    isUploading,
    formData,
  } = state;

  const {
    handleFileSelect,
    handleFileRemove,
    openPreviewDialog,
    handleAddResource,
    handleEditResource,
    handleDeleteResource,
    openEditDialog,
    setSearchTerm,
    setIsAddDialogOpen,
    setIsEditDialogOpen,
    setIsPreviewDialogOpen,
    setFormData,
    getStatusBadge,
    formatDate,
    formatFileSize,
    getAcceptedTypes,
    extractYouTubeVideoId,
    getPreviewContent,
  } = actions;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={`loading-skeleton-${i}`} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
      <ResourcesHeader 
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
      <ResourcesSearch 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* No Data State */}
      {!isLoading && !error && resources.length === 0 && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first resource.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Resource
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources Grid */}
      {!isLoading && !error && resources.length > 0 && (
        <ResourcesGrid
          resources={resources}
          onEdit={openEditDialog}
          onDelete={handleDeleteResource}
          onPreview={openPreviewDialog}
          getStatusBadge={getStatusBadge}
          formatDate={formatDate}
          formatFileSize={formatFileSize}
        />
      )}

      {/* Add Dialog */}
      <ResourceForm
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        setFormData={setFormData}
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        onFileRemove={handleFileRemove}
        onSubmit={handleAddResource}
        isSubmitting={isUploading}
        isEdit={false}
        getAcceptedTypes={getAcceptedTypes}
      />

      {/* Edit Dialog */}
      <ResourceForm
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        setFormData={setFormData}
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        onFileRemove={handleFileRemove}
        onSubmit={handleEditResource}
        isSubmitting={isUploading}
        isEdit={true}
        getAcceptedTypes={getAcceptedTypes}
      />

      {/* Preview Dialog */}
      <ResourcePreview
        isOpen={isPreviewDialogOpen}
        onOpenChange={setIsPreviewDialogOpen}
        resource={previewResource}
        getPreviewContent={getPreviewContent}
        formatFileSize={formatFileSize}
        extractYouTubeVideoId={extractYouTubeVideoId}
      />
    </div>
  );
} 