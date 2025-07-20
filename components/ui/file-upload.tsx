'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, FileText, Image, Video, Music, File, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  onFilePreview?: (file: File) => void;
  selectedFile?: File | null;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return Image;
  if (fileType.startsWith('video/')) return Video;
  if (fileType.startsWith('audio/')) return Music;
  if (fileType.includes('pdf')) return FileText;
  if (fileType.includes('docx') || fileType.includes('doc')) return FileText;
  return File;
};

const getFileTypeCategory = (fileType: string): 'pdf' | 'docx' | 'image' | 'video' | 'audio' => {
  if (fileType.includes('pdf')) return 'pdf';
  if (fileType.includes('docx') || fileType.includes('doc')) return 'docx';
  if (fileType.startsWith('image/')) return 'image';
  if (fileType.startsWith('video/')) return 'video';
  if (fileType.startsWith('audio/')) return 'audio';
  return 'pdf'; // default
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function FileUpload({
  onFileSelect,
  onFileRemove,
  onFilePreview,
  selectedFile,
  acceptedTypes = ['pdf', 'docx', 'image', 'video', 'audio'],
  maxSize = 50 * 1024 * 1024, // 50MB default
  className,
  disabled = false
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${formatFileSize(maxSize)}`;
    }

    // Check file type
    const fileType = getFileTypeCategory(file.type);
    if (!acceptedTypes.includes(fileType)) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  }, [maxSize, acceptedTypes]);

  const handleFileSelect = useCallback((file: File) => {
    setError(null);
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    onFileSelect(file);
  }, [validateFile, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleRemoveFile = useCallback(() => {
    if (onFileRemove) {
      onFileRemove();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
  }, [onFileRemove]);

  const getAcceptedExtensions = () => {
    const extensions: string[] = [];
    if (acceptedTypes.includes('pdf')) extensions.push('.pdf');
    if (acceptedTypes.includes('docx')) extensions.push('.docx', '.doc');
    if (acceptedTypes.includes('image')) extensions.push('.jpg', '.jpeg', '.png', '.gif', '.webp');
    if (acceptedTypes.includes('video')) extensions.push('.mp4', '.mov', '.avi', '.webm');
    if (acceptedTypes.includes('audio')) extensions.push('.mp3', '.wav', '.ogg', '.m4a');
    return extensions.join(',');
  };

  if (selectedFile) {
    const FileIcon = getFileIcon(selectedFile.type);
    
    return (
      <div className={cn("space-y-4", className)}>
        <div className="file-upload-zone has-file">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileIcon className="h-8 w-8 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {onFilePreview && (
                <button
                  type="button"
                  onClick={() => onFilePreview(selectedFile)}
                  className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                  disabled={disabled}
                  title="Preview file"
                >
                  <Eye className="h-5 w-5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                disabled={disabled}
                title="Remove file"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "file-upload-zone",
          isDragOver && "drag-over",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={getAcceptedExtensions()}
          onChange={handleFileInputChange}
          disabled={disabled}
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-gray-100 rounded-full">
              <Camera className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              {isDragOver ? 'Drop your file here' : 'Choose a file or drag it here'}
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: {acceptedTypes.join(', ').toUpperCase()}
            </p>
            <p className="text-xs text-gray-400">
              Max size: {formatFileSize(maxSize)}
            </p>
          </div>
          
          {!isDragOver && (
            <div className="flex justify-center">
              <Upload className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
} 