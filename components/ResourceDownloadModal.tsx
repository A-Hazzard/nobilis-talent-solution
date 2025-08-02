'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Download, 
  FileText, 
  Video, 
  BookOpen, 
  File, 
  Music, 
  Image as ImageIcon,
  Calendar,
  Star,
  Share2,
  X,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import type { Resource } from '@/shared/types/entities';
import { DownloadAnalyticsService } from '@/lib/services/DownloadAnalyticsService';
import { useAuth } from '@/hooks/useAuth';

interface ResourceDownloadModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (resourceId: string) => Promise<void>;
}

const typeLabels: Record<string, string> = {
  'pdf': 'PDF Document',
  'video': 'Video File',
  'article': 'Article',
  'whitepaper': 'Whitepaper',
  'template': 'Template',
  'audio': 'Audio File',
  'image': 'Image File',
  'other': 'File'
};

const typeIcons: Record<string, React.ReactNode> = {
  'pdf': <FileText className="h-6 w-6" />,
  'video': <Video className="h-6 w-6" />,
  'article': <BookOpen className="h-6 w-6" />,
  'whitepaper': <File className="h-6 w-6" />,
  'template': <FileText className="h-6 w-6" />,
  'audio': <Music className="h-6 w-6" />,
  'image': <ImageIcon className="h-6 w-6" />,
  'other': <File className="h-6 w-6" />
};

export default function ResourceDownloadModal({
  resource,
  isOpen,
  onClose,
  onDownload
}: ResourceDownloadModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [relatedResources, setRelatedResources] = useState<Array<{ id: string; title: string; type: string; description: string }>>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  
  const { user } = useAuth();
  const analyticsService = DownloadAnalyticsService.getInstance();

  // Load related resources when modal opens
  useEffect(() => {
    if (isOpen && resource) {
      loadRelatedResources();
    }
  }, [isOpen, resource]);

  const loadRelatedResources = async () => {
    if (!resource) return;
    
    setIsLoadingRelated(true);
    try {
      const related = await analyticsService.getRelatedResources(
        resource.id
      );
      setRelatedResources(related);
    } catch (error) {
      console.error('Error loading related resources:', error);
    } finally {
      setIsLoadingRelated(false);
    }
  };

  const handleDownload = async () => {
    if (!resource) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadComplete(false);

    // Simulate download progress
    const progressInterval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      // Track the download
      await analyticsService.trackDownload(
        resource.id,
        resource.title,
        user?.id,
        user?.email
      );

      // Perform the actual download
      await onDownload(resource.id);
      
      // Complete the progress
      clearInterval(progressInterval);
      setDownloadProgress(100);
      setDownloadComplete(true);
      
      // Auto-close after showing completion
      setTimeout(() => {
        onClose();
        setIsDownloading(false);
        setDownloadProgress(0);
        setDownloadComplete(false);
      }, 2000);
    } catch (error) {
      console.error('Download failed:', error);
      clearInterval(progressInterval);
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleShare = () => {
    if (navigator.share && resource) {
      navigator.share({
        title: resource.title,
        text: resource.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getTypeIcon = (type: string) => {
    return typeIcons[type] || typeIcons['other'];
  };

  if (!resource) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center text-white">
              {typeIcons[resource.type]}
            </div>
            <div>
              <div className="text-gray-900">{resource.title}</div>
              <div className="text-sm font-normal text-gray-600">{typeLabels[resource.type]}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resource Preview */}
          <Card className="border-2 border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{resource.category}</Badge>
                  {resource.featured && (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">
                {resource.description}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Added {resource.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>{resource.downloadCount.toLocaleString()} downloads</span>
                </div>
              </div>

              {resource.tags && resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Download Progress */}
          {isDownloading && (
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Downloading...</h4>
                    <p className="text-sm text-gray-600">Please wait while we prepare your download</p>
                  </div>
                </div>
                <Progress value={downloadProgress} className="h-2" />
                <p className="text-sm text-gray-600 mt-2">{downloadProgress}% complete</p>
              </CardContent>
            </Card>
          )}

          {/* Download Complete */}
          {downloadComplete && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-900">Download Complete!</h4>
                    <p className="text-sm text-green-700">Your file has been downloaded successfully</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Resources Suggestion */}
          <Card className="border-2 border-blue-100 bg-blue-50">
            <CardContent className="p-6">
              <h4 className="font-semibold text-blue-900 mb-3">💡 Related Resources</h4>
              <p className="text-sm text-blue-700 mb-4">
                Check out these related resources that might be helpful:
              </p>
              {isLoadingRelated ? (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Loading related resources...</span>
                </div>
              ) : relatedResources.length > 0 ? (
                <div className="space-y-2">
                  {relatedResources.map((related) => (
                    <div key={related.id} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                      {getTypeIcon(related.type)}
                      <span>{related.title}</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <FileText className="w-4 h-4" />
                    <span>Leadership Development Guide</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Video className="w-4 h-4" />
                    <span>Team Building Workshop Video</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <BookOpen className="w-4 h-4" />
                    <span>Communication Best Practices</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white border-0 h-12 rounded-xl"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Download Now
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDownloading}
              className="h-12 rounded-xl"
            >
              <X className="w-5 h-5 mr-2" />
              Cancel
            </Button>
          </div>

          {/* Thank You Message */}
          <div className="text-center text-sm text-gray-600">
            <p>Thank you for downloading our resource!</p>
            <p className="mt-1">We hope this helps you in your professional development journey.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 