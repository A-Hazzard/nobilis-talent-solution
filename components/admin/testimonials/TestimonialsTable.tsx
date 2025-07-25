'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import type { Testimonial } from '@/shared/types/entities';

interface TestimonialsTableProps {
  testimonials: Testimonial[];
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (id: string) => void;
  getStatusBadge: (isPublic: boolean) => { variant: string; className: string; icon: string; text: string };
  renderStars: (rating: number) => number[];
  formatDate: (date: Date) => string;
}

/**
 * Table component for displaying testimonials
 * Shows testimonial data in a structured table format
 */
export function TestimonialsTable({
  testimonials,
  onEdit,
  onDelete,
  getStatusBadge,
  renderStars,
  formatDate,
}: TestimonialsTableProps) {
  const renderStatusBadge = (isPublic: boolean) => {
    const badgeData = getStatusBadge(isPublic);
    const Icon = badgeData.icon === 'Eye' ? Eye : EyeOff;
    
    return (
      <Badge variant={badgeData.variant as any} className={badgeData.className}>
        <Icon className="h-3 w-3" />
        {badgeData.text}
      </Badge>
    );
  };





  return (
    <Card>
      <CardHeader>
        <CardTitle>All Testimonials ({testimonials.length})</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="w-full">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Client</TableHead>
                <TableHead className="hidden md:table-cell w-[120px]">Company</TableHead>
                <TableHead className="w-[80px]">Rating</TableHead>
                <TableHead className="min-w-[250px] max-w-[400px]">Content</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="hidden sm:table-cell w-[100px]">Date</TableHead>
                <TableHead className="w-[50px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.map((testimonial) => (
                <TableRow key={testimonial.id} data-testimonial-id={testimonial.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                        <AvatarFallback className="text-xs sm:text-sm">
                          {testimonial.clientName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate text-sm sm:text-base">{testimonial.clientName}</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate md:hidden">{testimonial.company}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className="text-xs">{testimonial.company}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {renderStars(testimonial.rating).map((filled, i) => (
                        <Star
                          key={`star-${testimonial.rating}-${i}`}
                          className={`h-3 w-3 sm:h-4 sm:w-4 ${
                            filled ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs sm:text-sm text-gray-500 ml-1">({testimonial.rating})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs sm:text-sm text-gray-600 truncate max-w-[200px] sm:max-w-[300px] lg:max-w-[400px] xl:max-w-[500px]">
                      {testimonial.content}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="hidden sm:block">
                      {renderStatusBadge(testimonial.isPublic)}
                    </div>
                    <div className="sm:hidden">
                      <Badge variant={testimonial.isPublic ? "default" : "secondary"} className="text-xs">
                        {testimonial.isPublic ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-xs sm:text-sm text-gray-500">
                      {formatDate(testimonial.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(testimonial)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => onDelete(testimonial.id)}
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
        </div>
      </CardContent>
    </Card>
  );
} 