import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Eye, Download, FileText, Image, Video, Music } from 'lucide-react';
import type { Resource } from '@/shared/types/entities';

interface ResourcesGridProps {
  resources: Resource[];
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
  onPreview: (resource: Resource) => void;
  getStatusBadge: (isPublic: boolean) => { variant: string; text: string };
  formatDate: (date: Date) => string;
  formatFileSize: (bytes: number) => string;
}

/**
 * Grid component for displaying resources
 * Shows resources in a card-based layout
 */
export function ResourcesGrid({
  resources,
  onEdit,
  onDelete,
  onPreview,
  getStatusBadge,
  formatDate,
  formatFileSize,
}: ResourcesGridProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'docx':
        return <FileText className="h-8 w-8" />;
      case 'image':
        return <Image className="h-8 w-8" />;
      case 'video':
        return <Video className="h-8 w-8" />;
      case 'audio':
        return <Music className="h-8 w-8" />;
      default:
        return <FileText className="h-8 w-8" />;
    }
  };

  const renderStatusBadge = (isPublic: boolean) => {
    const badgeData = getStatusBadge(isPublic);
    return (
      <Badge variant={badgeData.variant as any}>
        {badgeData.text}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <Card key={resource.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-gray-500">
                  {getTypeIcon(resource.type)}
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold line-clamp-2">
                    {resource.title}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {resource.category}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onPreview(resource)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(resource)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => onDelete(resource.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {resource.description}
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Type:</span>
                <Badge variant="outline" className="text-xs">
                  {resource.type.toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Status:</span>
                {renderStatusBadge(resource.isPublic)}
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Size:</span>
                <span className="text-gray-700">
                  {resource.fileUrl ? formatFileSize(1024 * 1024) : 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Created:</span>
                <span className="text-gray-700">
                  {formatDate(resource.createdAt)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 