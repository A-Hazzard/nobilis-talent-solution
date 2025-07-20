'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus, Search, FileText, Users, MoreHorizontal, Mail, Phone, Calendar, Building, Edit, Trash2, X, Check, Eye, EyeOff } from 'lucide-react';
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
import { 
  Search as SearchIcon, 
  Plus as PlusIcon, 
  MoreHorizontal as MoreHorizontalIcon, 
  Mail as MailIcon, 
  Phone as PhoneIcon,
  Calendar as CalendarIcon,
  Building as BuildingIcon,
  Edit as EditIcon,
  Trash2 as Trash2Icon,
  User,
  UserCheck,
  Lock
} from 'lucide-react';
import { LeadsService } from '@/lib/services/LeadsService';
import type { Lead } from '@/shared/types/entities';
import { toast } from 'sonner';
import { validateSignupForm, validatePassword } from '@/lib/utils/validation';

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-purple-100 text-purple-800',
  converted: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    organization?: string;
    challenges?: string;
  }>({});
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasSpecialChar: false
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
    phone: '',
  });
  const leadsService = new LeadsService();

  useEffect(() => {
    loadLeads();
  }, [currentPage, searchTerm]);

  const loadLeads = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await leadsService.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
      });
      
      if (response.error) {
        setError(response.error);
      } else {
        setLeads(response.leads);
        setTotalLeads(response.total);
      }
    } catch (error) {
      console.error('Failed to load leads:', error);
      setError('Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLead = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { id, error } = await leadsService.create(formData);
      
      if (error) {
        setError(error);
        toast.error(error);
      } else {
        toast.success("Lead account created successfully!");
        setIsAddDialogOpen(false);
        resetForm();
        loadLeads();
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      setError('Failed to create lead account');
      toast.error('Failed to create lead account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLead = async () => {
    if (!editingLead) return;
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await leadsService.update(editingLead.id, formData);
      if (response.error) {
        toast.error(response.error);
        // Keep modal open on error
      } else {
        toast.success("Lead updated successfully");
        setIsEditDialogOpen(false);
        setEditingLead(null);
        resetForm();
        
        // Refresh data and scroll to updated item
        await loadLeads();
        
        // Find and scroll to the updated lead
        setTimeout(() => {
          const updatedLeadElement = document.querySelector(`[data-lead-id="${editingLead.id}"]`);
          if (updatedLeadElement) {
            updatedLeadElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            // Add a brief highlight effect
            updatedLeadElement.classList.add('bg-blue-50', 'border-blue-200');
            setTimeout(() => {
              updatedLeadElement.classList.remove('bg-blue-50', 'border-blue-200');
            }, 2000);
          }
        }, 100);
      }
    } catch (error) {
      toast.error("Failed to update lead");
      // Keep modal open on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      const response = await leadsService.delete(id);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Lead deleted successfully");
        loadLeads();
      }
    } catch (error) {
      toast.error("Failed to delete lead");
    }
  };

  const openEditDialog = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      password: '',
      confirmPassword: '',
      organization: lead.organization || '',
      phone: lead.phone || '',
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      organization: '',
      phone: '',
    });
    setFieldErrors({});
    setPasswordValidation({
      hasMinLength: false,
      hasUppercase: false,
      hasSpecialChar: false
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);

    // Clear field-specific error when user starts typing
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Real-time password validation
    if (name === 'password') {
      const validation = validatePassword(value);
      setPasswordValidation({
        hasMinLength: validation.hasMinLength,
        hasUppercase: validation.hasUppercase,
        hasSpecialChar: validation.hasSpecialChar
      });
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

  const getFieldError = (fieldName: string) => {
    return fieldErrors[fieldName as keyof typeof fieldErrors];
  };

  const isFieldValid = (fieldName: string) => {
    return !getFieldError(fieldName) && formData[fieldName as keyof typeof formData]?.trim() !== '';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Leads</h1>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">Manage and track your leads</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
              <DialogDescription>
                Create a new lead account with authentication.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleAddLead(); }} className="space-y-4">
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
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${passwordValidation.hasMinLength ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-xs text-gray-600">At least 8 characters</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${passwordValidation.hasUppercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-xs text-gray-600">1 uppercase letter</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${passwordValidation.hasSpecialChar ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-xs text-gray-600">1 special character</span>
                    </div>
                  </div>
                )}
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

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Lead Account...' : 'Create Lead Account'}
                </Button>
              </DialogFooter>
            </form>
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

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">Filter</Button>
          </div>
        </CardContent>
      </Card>

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

      {/* Desktop Table View */}
      {!isLoading && !error && leads.length > 0 && (
        <div className="hidden lg:block">
          <Card>
            <CardHeader>
              <CardTitle>All Leads ({totalLeads})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id} data-lead-id={lead.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{`${lead.firstName} ${lead.lastName}`}</div>
                          <div className="text-sm text-gray-500">{lead.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          {lead.organization || 'Not specified'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {lead.phone && (
                            <PhoneIcon className="h-4 w-4 text-gray-400" />
                          )}
                          {lead.phone || 'No phone'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          {formatDate(lead.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(lead)}>
                              <EditIcon className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MailIcon className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <PhoneIcon className="mr-2 h-4 w-4" />
                              Call
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteLead(lead.id)}
                            >
                              <Trash2Icon className="mr-2 h-4 w-4" />
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
        </div>
      )}

      {/* Mobile Card View */}
      {!isLoading && !error && leads.length > 0 && (
        <div className="lg:hidden space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">All Leads ({totalLeads})</h2>
          </div>
          
          {leads.map((lead) => (
            <Card key={lead.id} className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{`${lead.firstName} ${lead.lastName}`}</h3>
                    <p className="text-sm text-gray-500">{lead.email}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(lead)}>
                        <EditIcon className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MailIcon className="mr-2 h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <PhoneIcon className="mr-2 h-4 w-4" />
                        Call
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteLead(lead.id)}
                      >
                        <Trash2Icon className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <BuildingIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{lead.organization || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{lead.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{formatDate(lead.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>
              Update the lead's information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-firstName" className="text-right">First Name</Label>
              <Input
                id="edit-firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-lastName" className="text-right">Last Name</Label>
              <Input
                id="edit-lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-password" className="text-right">Password</Label>
              <Input
                id="edit-password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-confirmPassword" className="text-right">Confirm Password</Label>
              <Input
                id="edit-confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-organization" className="text-right">Organization</Label>
              <Input
                id="edit-organization"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">Phone</Label>
              <Input
                id="edit-phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleEditLead} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Lead'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {totalLeads > 10 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 text-center sm:text-left">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalLeads)} of {totalLeads} leads
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage * 10 >= totalLeads}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 