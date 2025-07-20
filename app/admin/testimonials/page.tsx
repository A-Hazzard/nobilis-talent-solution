'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Star, Plus, Search, MoreHorizontal, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { testimonialsApi } from '@/lib/helpers/api';
import type { Testimonial } from '@/shared/types/entities';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    setIsLoading(true);
    try {
      const response = await testimonialsApi.getTestimonials();
      if (response.success && response.data) {
        setTestimonials(response.data.testimonials || []);
      }
    } catch (error) {
      console.error('Failed to load testimonials:', error);
      setTestimonials([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTestimonials = testimonials.filter(testimonial =>
    testimonial.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

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

      {/* Testimonials Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Testimonials ({filteredTestimonials.length})</CardTitle>
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
              {filteredTestimonials.map((testimonial) => (
                <TableRow key={testimonial.id}>
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
                    {new Date(testimonial.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
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
                        <DropdownMenuItem className="text-red-600">
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
          
          {filteredTestimonials.length === 0 && (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No testimonials found</p>
              <p className="text-sm text-gray-400">Add your first testimonial to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 