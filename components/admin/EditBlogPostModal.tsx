"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ImageIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomModal } from "@/components/ui/custom-modal";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { toast } from "sonner";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/config";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  status: string;
  featuredImage: string;
  author: string;
  readTime: number;
  publishedAt: string;
  updatedAt: string;
}

interface EditBlogPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: BlogPost | null;
  onSave: (updatedPost: Partial<BlogPost>) => Promise<void>;
  isUploading: boolean;
  setIsUploading: (uploading: boolean) => void;
}

export function EditBlogPostModal({
  isOpen,
  onClose,
  post,
  onSave,
  isUploading,
  setIsUploading,
}: EditBlogPostModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    status: "",
    featuredImage: "",
    author: "",
    readTime: 0,
  });

  // Reset form when post changes
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        category: post.category || "",
        status: post.status || "",
        featuredImage: post.featuredImage || "",
        author: post.author || "",
        readTime: post.readTime || 0,
      });
    }
  }, [post]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
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
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      setFormData(prev => ({
        ...prev,
        featuredImage: downloadURL,
      }));
      
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Failed to update post");
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "",
      status: "",
      featuredImage: "",
      author: "",
      readTime: 0,
    });
    onClose();
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
        {isUploading ? "Updating..." : "Update Post"}
      </Button>
    </div>
  );

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Blog Post"
      description="Update the blog post details below."
      maxWidth="max-w-4xl"
      footer={footer}
      className="max-h-[95vh]"
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Cover Image */}
        <div className="space-y-2">
          <Label htmlFor="featuredImage">Cover Image</Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="featuredImage"
                value={formData.featuredImage}
                onChange={(e) => handleInputChange("featuredImage", e.target.value)}
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
              <Image
                src={formData.featuredImage}
                alt="Featured image preview"
                width={400}
                height={160}
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
            onChange={(e) => handleInputChange("title", e.target.value)}
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
            onChange={(e) => handleInputChange("excerpt", e.target.value)}
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
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strategy">Strategy</SelectItem>
                <SelectItem value="leadership">Leadership</SelectItem>
                <SelectItem value="team-building">Team Building</SelectItem>
                <SelectItem value="change-management">Change Management</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="innovation">Innovation</SelectItem>
                <SelectItem value="culture">Culture</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
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
              onChange={(e) => handleInputChange("author", e.target.value)}
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
              onChange={(e) => handleInputChange("readTime", parseInt(e.target.value) || 0)}
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
              onChange={(content) => handleInputChange("content", content)}
              placeholder="Write your blog post content here..."
              className="min-h-[250px] sm:min-h-[300px]"
            />
          </div>
        </div>
      </div>
    </CustomModal>
  );
}
