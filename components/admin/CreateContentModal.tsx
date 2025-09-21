"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, Upload } from "lucide-react";
import { CustomModal } from "@/components/ui/custom-modal";
import dynamic from "next/dynamic";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/config";
import { toast } from "sonner";
import type { BlogPost, Resource } from "@/shared/types/entities";

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(
  () =>
    import("@/components/ui/rich-text-editor").then(
      (mod) => mod.RichTextEditor
    ),
  { ssr: false }
);

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, file?: File) => Promise<void>;
  isUploading: boolean;
  setIsUploading: (loading: boolean) => void;
}

export function CreateContentModal({
  isOpen,
  onClose,
  onSave,
  isUploading,
  setIsUploading,
}: CreateContentModalProps) {
  const [contentType, setContentType] = useState<"blog" | "resource">("blog");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "leadership",
    tags: [] as string[],
    status: "draft" as BlogPost["status"],
    author: "admin",
    authorName: "Kareem Payne",
    seoTitle: "",
    seoDescription: "",
    readTime: 0,
    featuredImage: "",
    featured: false,
    resources: [] as string[],
    references: [] as Array<{
      title: string;
      url: string;
      description?: string;
    }>,
    scheduledDate: "",
    scheduledTime: "",
    isScheduled: false,
  });

  const [resourceFormData, setResourceFormData] = useState({
    title: "",
    description: "",
    type: "pdf" as Resource["type"],
    category: "leadership" as Resource["category"],
    isPublic: true,
    featured: false,
    tags: [] as string[],
    relatedResources: [] as string[],
    thumbnailUrl: "",
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedResourceFile, setSelectedResourceFile] = useState<File | null>(null);

  const categories = [
    "leadership",
    "team-building",
    "communication",
    "strategy",
    "management",
    "productivity",
    "innovation",
    "culture",
    "other",
  ];

  const resourceTypes = [
    { value: "pdf", label: "PDF Document" },
    { value: "docx", label: "Word Document" },
    { value: "image", label: "Image" },
    { value: "video", label: "Video" },
    { value: "audio", label: "Audio" },
    { value: "article", label: "Article" },
    { value: "whitepaper", label: "Whitepaper" },
    { value: "template", label: "Template" },
    { value: "toolkit", label: "Toolkit" },
  ];

  const resourceCategories = [
    { value: "leadership", label: "Leadership" },
    { value: "team-building", label: "Team Building" },
    { value: "communication", label: "Communication" },
    { value: "strategy", label: "Strategy" },
    { value: "videos", label: "Videos" },
    { value: "articles", label: "Articles" },
    { value: "pdfs", label: "PDFs" },
    { value: "whitepapers", label: "Whitepapers" },
    { value: "other", label: "Other" },
  ];

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      category: "leadership",
      tags: [],
      status: "draft",
      author: "admin",
      authorName: "Kareem Payne",
      seoTitle: "",
      seoDescription: "",
      readTime: 0,
      featuredImage: "",
      featured: false,
      resources: [],
      references: [],
      scheduledDate: "",
      scheduledTime: "",
      isScheduled: false,
    });
    setResourceFormData({
      title: "",
      description: "",
      type: "pdf",
      category: "leadership",
      isPublic: true,
      featured: false,
      tags: [],
      relatedResources: [],
      thumbnailUrl: "",
    });
    setSelectedImage(null);
    setSelectedResourceFile(null);
    setContentType("blog");
  };

  const handleSave = async () => {
    if (contentType === "blog") {
      if (!formData.title || !formData.content || !formData.excerpt) {
        toast.error("Please fill in all required fields");
        return;
      }
      await onSave(formData, selectedImage || undefined);
    } else {
      if (!resourceFormData.title || !resourceFormData.description) {
        toast.error("Please fill in all required fields");
        return;
      }
      if (!selectedResourceFile && resourceFormData.type !== "video") {
        toast.error("Please select a file to upload");
        return;
      }
      await onSave(resourceFormData, selectedResourceFile || undefined);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const timestamp = Date.now();
      const fileName = `blog-featured-images/${timestamp}-${file.name}`;
      const storageRef = ref(storage, fileName);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      setFormData(prev => ({
        ...prev,
        featuredImage: downloadURL,
      }));
      toast.success("Featured image uploaded successfully");
    } catch (error) {
      console.error("Error uploading featured image:", error);
      toast.error("Failed to upload featured image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleResourceImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const timestamp = Date.now();
      const fileName = `resource-thumbnails/${timestamp}-${file.name}`;
      const storageRef = ref(storage, fileName);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      setResourceFormData(prev => ({
        ...prev,
        thumbnailUrl: downloadURL,
      }));
      toast.success("Thumbnail image uploaded successfully");
    } catch (error) {
      console.error("Error uploading thumbnail image:", error);
      toast.error("Failed to upload thumbnail image");
    } finally {
      setIsUploading(false);
    }
  };

  const footer = (
    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
      <Button
        variant="outline"
        onClick={handleClose}
        disabled={isUploading}
        className="w-full sm:w-auto order-2 sm:order-1"
      >
        Cancel
      </Button>
      <Button
        onClick={handleSave}
        disabled={isUploading}
        className="w-full sm:w-auto min-w-[120px] order-1 sm:order-2"
      >
        {isUploading ? "Creating..." : "Create Content"}
      </Button>
    </div>
  );

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Content"
      description="Choose the type of content you want to create."
      maxWidth="max-w-4xl"
      footer={footer}
      className="max-h-[95vh]"
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Content Type Tabs */}
        <Tabs
          value={contentType}
          onValueChange={(value) => setContentType(value as "blog" | "resource")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="blog">Blog Post</TabsTrigger>
            <TabsTrigger value="resource">Resource</TabsTrigger>
          </TabsList>
          
          <TabsContent value="blog" className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Write and publish a new blog post with rich content editing.
            </div>
            
            {/* Cover Image */}
            <div className="space-y-2">
              <Label htmlFor="featuredImage">Cover Image</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="featuredImage"
                    value={formData.featuredImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                    className="pl-10"
                    placeholder="Enter image URL or upload a file"
                  />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("image-upload")?.click()}
                  disabled={isUploading}
                  className="shrink-0 w-full sm:w-auto"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              {formData.featuredImage && (
                <div className="mt-2">
                  <img
                    src={formData.featuredImage}
                    alt="Featured image preview"
                    className="w-full h-32 sm:h-40 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter blog post title"
                className="w-full"
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt *</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Enter a brief description of the blog post"
                rows={3}
                className="w-full"
              />
            </div>

            {/* Category and Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as BlogPost["status"] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Author and Read Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Enter author name"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="readTime">Read Time (minutes)</Label>
                <Input
                  id="readTime"
                  type="number"
                  value={formData.readTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, readTime: parseInt(e.target.value) || 0 }))}
                  placeholder="Estimated read time"
                  className="w-full"
                  min="1"
                />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <div className="border rounded-md">
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  placeholder="Write your blog post content here..."
                  className="min-h-[250px] sm:min-h-[300px]"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="resource" className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Upload and manage downloadable resources for your audience.
            </div>
            
            {/* Resource Title */}
            <div className="space-y-2">
              <Label htmlFor="resourceTitle">Title *</Label>
              <Input
                id="resourceTitle"
                value={resourceFormData.title}
                onChange={(e) => setResourceFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter resource title"
                className="w-full"
              />
            </div>

            {/* Resource Description */}
            <div className="space-y-2">
              <Label htmlFor="resourceDescription">Description *</Label>
              <Textarea
                id="resourceDescription"
                value={resourceFormData.description}
                onChange={(e) => setResourceFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the resource"
                rows={3}
                className="w-full"
              />
            </div>

            {/* Resource Type and Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resourceType">Type *</Label>
                <Select
                  value={resourceFormData.type}
                  onValueChange={(value) => setResourceFormData(prev => ({ ...prev, type: value as Resource["type"] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resourceCategory">Category *</Label>
                <Select
                  value={resourceFormData.category}
                  onValueChange={(value) => setResourceFormData(prev => ({ ...prev, category: value as Resource["category"] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Resource File Upload */}
            <div className="space-y-2">
              <Label htmlFor="resourceFile">File *</Label>
              <Input
                id="resourceFile"
                type="file"
                onChange={(e) => setSelectedResourceFile(e.target.files?.[0] || null)}
                className="w-full"
              />
            </div>

            {/* Resource Thumbnail URL */}
            <div className="space-y-2">
              <Label htmlFor="resourceThumbnailUrl">Thumbnail URL (optional)</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="resourceThumbnailUrl"
                    value={resourceFormData.thumbnailUrl}
                    onChange={(e) => setResourceFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                    className="pl-10"
                    placeholder="Enter image URL or upload a file"
                  />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleResourceImageUpload(file);
                  }}
                  className="hidden"
                  id="resource-thumbnail-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("resource-thumbnail-upload")?.click()}
                  disabled={isUploading}
                  className="shrink-0 w-full sm:w-auto"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              {resourceFormData.thumbnailUrl && (
                <div className="mt-2">
                  <img
                    src={resourceFormData.thumbnailUrl}
                    alt="Resource thumbnail preview"
                    className="w-full h-32 sm:h-40 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>

            {/* Public/Private Toggle */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="resourcePublic"
                  checked={resourceFormData.isPublic}
                  onCheckedChange={(checked) => setResourceFormData(prev => ({ ...prev, isPublic: checked as boolean }))}
                />
                <Label htmlFor="resourcePublic">Make this resource publicly accessible</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </CustomModal>
  );
}
