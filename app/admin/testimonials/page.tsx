'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Star, Plus, Search, MoreHorizontal, Edit, Trash2, Eye, EyeOff, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TestimonialsService } from '@/lib/services/TestimonialsService';
import type { Testimonial } from '@/shared/types/entities';
import { toast } from 'sonner';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    clientName: '',
    company: '',
    content: '',
    rating: 5,
    isPublic: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const testimonialsService = new TestimonialsService();

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await testimonialsService.getAll({ search: searchTerm || undefined });
      if (response.error) {
        setError(response.error);
      } else {
        setTestimonials(response.testimonials);
      }
    } catch (error) {
      console.error('Failed to load testimonials:', error);
      setError('Failed to load testimonials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTestimonial = async () => {
    if (!formData.clientName || !formData.company || !formData.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.rating < 1 || formData.rating > 5) {
      toast.error("Rating must be between 1 and 5");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await testimonialsService.create(formData);
      if (response.error) {
        toast.error(response.error);
        // Keep modal open on error
      } else {
        toast.success("Testimonial added successfully");
        setIsAddDialogOpen(false);
        resetForm();
        
        // Refresh data and scroll to new item
        await loadTestimonials();
        
        // Find and scroll to the newly added testimonial
        setTimeout(() => {
          const newTestimonialElement = document.querySelector(`[data-testimonial-id="${response.id}"]`);
          if (newTestimonialElement) {
            newTestimonialElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            // Add a brief highlight effect
            newTestimonialElement.classList.add('bg-green-50', 'border-green-200');
            setTimeout(() => {
              newTestimonialElement.classList.remove('bg-green-50', 'border-green-200');
            }, 2000);
          }
        }, 100);
      }
    } catch (error) {
      toast.error("Failed to add testimonial");
      // Keep modal open on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTestimonial = async () => {
    if (!editingTestimonial) return;
    
    if (!formData.clientName || !formData.company || !formData.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.rating < 1 || formData.rating > 5) {
      toast.error("Rating must be between 1 and 5");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await testimonialsService.update(editingTestimonial.id, formData);
      if (response.error) {
        toast.error(response.error);
        // Keep modal open on error
      } else {
        toast.success("Testimonial updated successfully");
        setIsEditDialogOpen(false);
        setEditingTestimonial(null);
        resetForm();
        
        // Refresh data and scroll to updated item
        await loadTestimonials();
        
        // Find and scroll to the updated testimonial
        setTimeout(() => {
          const updatedTestimonialElement = document.querySelector(`[data-testimonial-id="${editingTestimonial.id}"]`);
          if (updatedTestimonialElement) {
            updatedTestimonialElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            // Add a brief highlight effect
            updatedTestimonialElement.classList.add('bg-blue-50', 'border-blue-200');
            setTimeout(() => {
              updatedTestimonialElement.classList.remove('bg-blue-50', 'border-blue-200');
            }, 2000);
          }
        }, 100);
      }
    } catch (error) {
      toast.error("Failed to update testimonial");
      // Keep modal open on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    
    try {
      const response = await testimonialsService.delete(id);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Testimonial deleted successfully");
        loadTestimonials();
      }
    } catch (error) {
      toast.error("Failed to delete testimonial");
    }
  };

  const openEditDialog = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      clientName: testimonial.clientName,
      company: testimonial.company,
      content: testimonial.content,
      rating: testimonial.rating,
      isPublic: testimonial.isPublic,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      company: '',
      content: '',
      rating: 5,
      isPublic: true,
    });
  };

  const getStatusBadge = (isPublic: boolean) => {
    return isPublic ? (
      <Badge variant="default" className="flex items-center gap-1">
        <Eye className="h-3 w-3" />
        Published
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1">
        <EyeOff className="h-3 w-3" />
        Draft
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-600">Manage client testimonials and reviews</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Testimonial</DialogTitle>
              <DialogDescription>
                Enter the testimonial details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="clientName" className="text-right">Client Name</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-right">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="content" className="text-right">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="col-span-3"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rating" className="text-right">Rating</Label>
                <Select value={formData.rating.toString()} onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Star</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isPublic" className="text-right">Status</Label>
                <Select value={formData.isPublic.toString()} onValueChange={(value) => setFormData({ ...formData, isPublic: value === 'true' })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Published</SelectItem>
                    <SelectItem value="false">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddTestimonial}>Add Testimonial</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search testimonials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

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
        <Card>
          <CardHeader>
            <CardTitle>All Testimonials ({testimonials.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testimonials.map((testimonial) => (
                  <TableRow key={testimonial.id} data-testimonial-id={testimonial.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {testimonial.clientName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{testimonial.clientName}</p>
                          <p className="text-sm text-gray-500">{testimonial.company}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{testimonial.company}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {renderStars(testimonial.rating)}
                        <span className="text-sm text-gray-500 ml-1">({testimonial.rating})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600 max-w-xs truncate">
                        {testimonial.content}
                      </p>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(testimonial.isPublic)}
                    </TableCell>
                    <TableCell>
                      {formatDate(testimonial.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(testimonial)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {testimonial.isPublic ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteTestimonial(testimonial.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Testimonial</DialogTitle>
            <DialogDescription>
              Update the testimonial details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-clientName" className="text-right">Client Name</Label>
              <Input
                id="edit-clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-company" className="text-right">Company</Label>
              <Input
                id="edit-company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-content" className="text-right">Content</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="col-span-3"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-rating" className="text-right">Rating</Label>
              <Select value={formData.rating.toString()} onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Star</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-isPublic" className="text-right">Status</Label>
              <Select value={formData.isPublic.toString()} onValueChange={(value) => setFormData({ ...formData, isPublic: value === 'true' })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Published</SelectItem>
                  <SelectItem value="false">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleEditTestimonial}>Update Testimonial</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 