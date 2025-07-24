'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, FileText, Image, Video, Music } from 'lucide-react';
import type { Resource } from '@/shared/types/entities';

interface ResourcePreviewProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  resource: Resource | null;
  getPreviewContent: () => { type: 'file'; file: File } | { type: 'resource'; resource: Resource } | null;
  formatFileSize: (bytes: number) => string;
  extractYouTubeVideoId: (url: string) => string | null;
}

/**
 * Preview component for resources
 * Displays resource content in a modal
 */
export function ResourcePreview({
  isOpen,
  onOpenChange,
  resource,
  getPreviewContent,
  formatFileSize,
  extractYouTubeVideoId,
}: ResourcePreviewProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'docx':
        return <FileText className="h-6 w-6" />;
      case 'image':
        return <Image className="h-6 w-6" />;
      case 'video':
        return <Video className="h-6 w-6" />;
      case 'audio':
        return <Music className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  const renderPreviewContent = () => {
    const previewData = getPreviewContent();
    
    if (!previewData) {
      return (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>No preview available</p>
        </div>
      );
    }

    if (previewData.type === 'file') {
      const file = previewData.file;
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      if (fileType.startsWith('image/') || fileName.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
        return (
          <div className="flex justify-center">
            <img 
              src={URL.createObjectURL(file)} 
              alt={file.name}
              className="max-w-full max-h-96 object-contain rounded-lg"
            />
          </div>
        );
      }

      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        return (
          <div className="w-full h-96">
            <iframe
              src={URL.createObjectURL(file)}
              className="w-full h-full border rounded-lg"
              title={file.name}
            />
          </div>
        );
      }

      if (fileType.startsWith('video/') || fileName.match(/\.(mp4|mov|avi|webm|mkv)$/)) {
        return (
          <div className="flex justify-center">
            <video 
              controls 
              className="max-w-full max-h-96 rounded-lg"
              src={URL.createObjectURL(file)}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      }

      if (fileType.startsWith('audio/') || fileName.match(/\.(mp3|wav|ogg|m4a|aac)$/)) {
        return (
          <div className="flex justify-center">
            <audio 
              controls 
              className="w-full max-w-md"
              src={URL.createObjectURL(file)}
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      }

      return (
        <div className="text-center p-8">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{file.name}</h3>
          <p className="text-sm text-gray-500 mb-4">
            Size: {formatFileSize(file.size)}
          </p>
          <p className="text-sm text-gray-500">
            Type: {file.type || 'Unknown'}
          </p>
        </div>
      );
    }

    if (previewData.type === 'resource') {
      const resource = previewData.resource;
      
      if (resource.type === 'video' && resource.fileUrl) {
        if (resource.fileUrl.includes('youtube.com') || resource.fileUrl.includes('youtu.be')) {
          const videoId = extractYouTubeVideoId(resource.fileUrl);
          if (videoId) {
            return (
              <div className="flex justify-center">
                <iframe
                  width="560"
                  height="315"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={resource.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                />
              </div>
            );
          }
        }
        
        return (
          <div className="flex justify-center">
            <video 
              controls 
              className="max-w-full max-h-96 rounded-lg"
              src={resource.fileUrl}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      }

      if (resource.type === 'image' && resource.fileUrl) {
        return (
          <div className="flex justify-center">
            <img 
              src={resource.fileUrl} 
              alt={resource.title}
              className="max-w-full max-h-96 object-contain rounded-lg"
            />
          </div>
        );
      }

      if (resource.type === 'audio' && resource.fileUrl) {
        return (
          <div className="flex justify-center">
            <audio 
              controls 
              className="w-full max-w-md"
              src={resource.fileUrl}
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      }

      return (
        <div className="text-center p-8">
          {getTypeIcon(resource.type)}
          <h3 className="text-lg font-medium text-gray-900 mb-2">{resource.title}</h3>
          <p className="text-sm text-gray-500 mb-4">{resource.description}</p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Type: {resource.type.toUpperCase()}</p>
            <p className="text-sm text-gray-500">Category: {resource.category}</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {resource && getTypeIcon(resource.type)}
            {resource?.title || 'Resource Preview'}
          </DialogTitle>
          <DialogDescription>
            {resource?.description || 'Preview the resource content'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {renderPreviewContent()}
        </div>

        {resource && (
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-500">
              {resource.fileUrl && (
                <span className="block">Size: {formatFileSize(1024 * 1024)}</span>
              )}
              <span className="block">Type: {resource.type.toUpperCase()}</span>
            </div>
            <div className="flex gap-2">
              {resource.fileUrl && (
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 