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

  const renderStarRating = (rating: number) => {
    const stars = renderStars(rating);
    
    return (
      <div className="flex items-center space-x-1">
        {stars.map((filled, i) => (
          <Star
            key={`star-${rating}-${i}`}
            className={`h-4 w-4 ${
              filled ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-500 ml-1">({rating})</span>
      </div>
    );
  };

  return (
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
                  {renderStarRating(testimonial.rating)}
                </TableCell>
                <TableCell>
                  <p className="text-sm text-gray-600 max-w-xs truncate">
                    {testimonial.content}
                  </p>
                </TableCell>
                <TableCell>
                  {renderStatusBadge(testimonial.isPublic)}
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
                      <DropdownMenuItem onClick={() => onEdit(testimonial)}>
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
      </CardContent>
    </Card>
  );
} 