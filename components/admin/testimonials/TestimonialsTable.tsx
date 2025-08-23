'use client';


import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  ResponsiveTable,
  ResponsiveBadge,
  ResponsiveAvatar,
  ResponsiveText,
  ResponsiveSecondaryText,
} from '@/components/ui/responsive-table';
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





  const columns = [
    {
      key: 'client',
      label: 'Client',
      render: (testimonial: Testimonial) => (
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
      ),
      mobileRender: (testimonial: Testimonial) => (
        <div className="flex items-center space-x-3">
          <ResponsiveAvatar fallback={testimonial.clientName.split(' ').map(n => n[0]).join('')} />
          <div className="min-w-0 flex-1">
            <ResponsiveText className="font-medium">{testimonial.clientName}</ResponsiveText>
            <ResponsiveSecondaryText>{testimonial.company}</ResponsiveSecondaryText>
          </div>
        </div>
      ),
    },
    {
      key: 'company',
      label: 'Company',
      render: (testimonial: Testimonial) => (
        <Badge variant="outline" className="text-xs">{testimonial.company}</Badge>
      ),
      mobileRender: (testimonial: Testimonial) => (
        <ResponsiveBadge variant="outline">{testimonial.company}</ResponsiveBadge>
      ),
      hideOnMobile: true,
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (testimonial: Testimonial) => (
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
      ),
      mobileRender: (testimonial: Testimonial) => (
        <div className="flex items-center space-x-1">
          {renderStars(testimonial.rating).map((filled, i) => (
            <Star
              key={`star-${testimonial.rating}-${i}`}
              className={`h-3 w-3 ${
                filled ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">({testimonial.rating})</span>
        </div>
      ),
    },
    {
      key: 'content',
      label: 'Content',
      render: (testimonial: Testimonial) => (
        <p className="text-xs sm:text-sm text-gray-600 truncate max-w-[200px] sm:max-w-[300px] lg:max-w-[400px] xl:max-w-[500px]">
          {testimonial.content}
        </p>
      ),
      mobileRender: (testimonial: Testimonial) => (
        <ResponsiveText className="line-clamp-3">{testimonial.content}</ResponsiveText>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (testimonial: Testimonial) => (
        <div className="hidden sm:block">
          {renderStatusBadge(testimonial.isPublic)}
        </div>
      ),
      mobileRender: (testimonial: Testimonial) => (
        <ResponsiveBadge variant={testimonial.isPublic ? "default" : "secondary"}>
          {testimonial.isPublic ? "Published" : "Draft"}
        </ResponsiveBadge>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (testimonial: Testimonial) => (
        <span className="text-xs sm:text-sm text-gray-500">
          {formatDate(testimonial.createdAt)}
        </span>
      ),
      mobileRender: (testimonial: Testimonial) => (
        <ResponsiveSecondaryText>{formatDate(testimonial.createdAt)}</ResponsiveSecondaryText>
      ),
      hideOnMobile: true,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (testimonial: Testimonial) => (
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
      ),
      mobileRender: (testimonial: Testimonial) => (
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(testimonial);
            }}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(testimonial.id);
            }}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <ResponsiveTable
      data={testimonials}
      columns={columns}
      title={`All Testimonials (${testimonials.length})`}
      className="space-y-4"
    />
  );
} 