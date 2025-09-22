"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertCircle, 
  FileText, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Clock,
  User,
  Image as ImageIcon,
  BookOpen,
  Download,
  File,
  Upload,
  CheckCircle,
  Star,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlogService } from "@/lib/services/BlogService";
import { ResourcesService } from "@/lib/services/ResourcesService";
import { toast } from "sonner";
import type { BlogPost, Resource } from "@/shared/types/entities";
import { logAuditAction } from "@/lib/utils/auditUtils";
import dynamic from "next/dynamic";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/config";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { CreateContentModal } from "@/components/admin/CreateContentModal";

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(
  () =>
    import("@/components/ui/rich-text-editor").then(
      (mod) => mod.RichTextEditor
    ),
  { ssr: false }
);

export default function ContentPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("blogs");
  const [contentType, setContentType] = useState<"blog" | "resource">("blog");

  // Filter state
  const [resourceTypeFilter, setResourceTypeFilter] = useState("all");
  const [resourceCategoryFilter, setResourceCategoryFilter] = useState("all");
  const [resourceStatusFilter, setResourceStatusFilter] = useState("all");
  const [blogCategoryFilter, setBlogCategoryFilter] = useState("all");
  const [blogStatusFilter, setBlogStatusFilter] = useState("all");
  
  // Resource management state
  const [isEditResourceDialogOpen, setIsEditResourceDialogOpen] =
    useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [selectedResourceFile, setSelectedResourceFile] = useState<File | null>(
    null
  );
  const [lastAutoSaved, setLastAutoSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  
  // Confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ type: 'blog' | 'resource'; id: string; title: string } | null>(null);
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
    resources: [] as string[], // Associated resource IDs
    references: [] as Array<{
      title: string;
      url: string;
      description?: string;
    }>, // External references/links
    scheduledDate: "",
    scheduledTime: "",
    isScheduled: false,
  });

  const blogService = new BlogService();
  const resourcesService = new ResourcesService();

  // Auto-save functionality
  const handleAutoSave = async (content: string) => {
    if (!editingPost) return; // Only auto-save when editing existing posts

    setIsAutoSaving(true);
    try {
      await blogService.update(editingPost.id, { content });
      setLastAutoSaved(new Date());
      toast.success("Draft auto-saved");
    } catch (error) {
      console.error("Auto-save failed:", error);
      toast.error("Auto-save failed");
    } finally {
      setIsAutoSaving(false);
    }
  };

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

  // Debounced search effect - only search if 3+ characters or Enter pressed
  useEffect(() => {
    // Don't search if less than 3 characters (unless it's empty to show all)
    if (searchTerm.length > 0 && searchTerm.length < 3) {
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Increased delay to 500ms

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search effect
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return; // Only search when debounced term matches current term

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [blogResponse, resourcesResponse] = await Promise.all([
          blogService.getAll({ search: debouncedSearchTerm || undefined }),
          resourcesService.getAll({ search: debouncedSearchTerm || undefined }),
        ]);

        if (blogResponse.error) {
          setError(blogResponse.error);
        } else {
          setPosts(blogResponse.posts);
        }

        if (resourcesResponse.error) {
          console.error("Failed to load resources:", resourcesResponse.error);
        } else {
          setResources(resourcesResponse.resources);
        }
      } catch (err) {
        console.error("Failed to search data:", err);
        setError("Failed to search data");
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm]);

  // Handle Enter key press for immediate search
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setDebouncedSearchTerm(searchTerm);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [blogResponse, resourcesResponse] = await Promise.all([
        blogService.getAll({}), // Load all posts without search filter
        resourcesService.getAll({}), // Load all resources without search filter
      ]);
      
      if (blogResponse.error) {
        setError(blogResponse.error);
      } else {
        setPosts(blogResponse.posts);
      }
      
      if (resourcesResponse.error) {
        console.error("Failed to load resources:", resourcesResponse.error);
      } else {
        setResources(resourcesResponse.resources);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const openPreviewDialog = (post: BlogPost) => {
    setPreviewPost(post);
    setIsPreviewDialogOpen(true);
  };

  const handleAddPost = async () => {
    // Validate required fields
    const missingFields = [];
    if (!formData.title) missingFields.push("Title");
    if (!formData.content) missingFields.push("Content");
    if (!formData.excerpt) missingFields.push("Excerpt");
    
    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    // Validate featured blog posts limit
    if (formData.featured) {
      const currentFeaturedCount = posts.filter((post) => post.featured).length;
      
      if (currentFeaturedCount >= 3) {
        toast.error("Maximum of 3 featured blog posts allowed. Please unfeature another blog post first.");
        return;
      }
    }

    setIsUploading(true);
    try {
      const response = await blogService.create(
        formData,
        selectedImage || undefined
      );
      if (response.error) {
        toast.error(response.error);
      } else {
        // Log audit action
        await logAuditAction({
          action: "create",
          entity: "blog",
          entityId: response.id,
          timestamp: Date.now(),
          details: {
            title: `Blog post created: ${formData.title}`,
            postTitle: formData.title,
            postCategory: formData.category,
            postStatus: formData.status,
            postAuthor: formData.authorName,
          },
        });

        toast.success("Blog post created successfully");
        setIsAddDialogOpen(false);
        resetForm();
        await loadData();
      }
    } catch (error) {
      console.error("Exception in handleAddPost:", error);
      toast.error("Failed to create blog post");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditPost = async () => {
    if (!editingPost) return;
    
    // Validate required fields
    const missingFields = [];
    if (!formData.title) missingFields.push("Title");
    if (!formData.content) missingFields.push("Content");
    if (!formData.excerpt) missingFields.push("Excerpt");
    
    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    // Validate featured blog posts limit
    if (formData.featured) {
      const currentFeaturedCount = posts.filter((post) => post.featured).length;
      const isAlreadyFeatured = posts.some((post) => post.featured && post.id === editingPost.id);
      
      if (currentFeaturedCount >= 3 && !isAlreadyFeatured) {
        toast.error("Maximum of 3 featured blog posts allowed. Please unfeature another blog post first.");
        return;
      }
    }

    setIsUploading(true);
    try {
      const response = await blogService.update(
        editingPost.id,
        formData,
        selectedImage || undefined
      );
      if (response.error) {
        toast.error(response.error);
      } else {
        // Log audit action
        await logAuditAction({
          action: "update",
          entity: "blog",
          entityId: editingPost.id,
          timestamp: Date.now(),
          details: {
            title: `Blog post updated: ${formData.title}`,
            postTitle: formData.title,
            postCategory: formData.category,
            postStatus: formData.status,
            postAuthor: formData.authorName,
            previousTitle: editingPost.title,
          },
        });

        toast.success("Blog post updated successfully");
        setIsEditDialogOpen(false);
        setEditingPost(null);
        resetForm();
        await loadData();
      }
    } catch {
      toast.error("Failed to update blog post");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePost = (id: string) => {
    const postToDelete = posts.find((post) => post.id === id);
    if (postToDelete) {
      setDeleteItem({
        type: 'blog',
        id,
        title: postToDelete.title
      });
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDeletePost = async () => {
    if (!deleteItem) return;
    
    try {
      // Get post details before deletion for audit log
      const postToDelete = posts.find((post) => post.id === deleteItem.id);

      const response = await blogService.delete(deleteItem.id);
      if (response.error) {
        toast.error(response.error);
      } else {
        // Log audit action
        if (postToDelete) {
          await logAuditAction({
            action: "delete",
            entity: "blog",
            entityId: deleteItem.id,
            timestamp: Date.now(),
            details: {
              title: `Blog post deleted: ${postToDelete.title}`,
              postTitle: postToDelete.title,
              postCategory: postToDelete.category,
              postAuthor: postToDelete.authorName,
            },
          });
        }

        toast.success("Blog post deleted successfully");
        loadData();
      }
    } catch {
      toast.error("Failed to delete blog post");
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItem(null);
    }
  };

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags,
      status: post.status,
      author: post.author,
      authorName: post.authorName,
      seoTitle: post.seoTitle || "",
      seoDescription: post.seoDescription || "",
      readTime: post.readTime || 0,
      featuredImage: post.featuredImage || "",
      featured: Boolean(post.featured),
      resources: post.resources || [],
      references: post.references || [],
      scheduledDate: post.scheduledDate || "",
      scheduledTime: post.scheduledTime || "",
      isScheduled: post.isScheduled || false,
    });
    setSelectedImage(null);
    setIsEditDialogOpen(true);
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
    setSelectedImage(null);
    setContentType("blog");
    resetResourceForm();
  };

  const resetResourceForm = () => {
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
    setSelectedResourceFile(null);
  };

  const handleAddResource = async () => {
    // Validate required fields
    const missingFields = [];
    if (!resourceFormData.title) missingFields.push("Title");
    if (!resourceFormData.description) missingFields.push("Description");
    
    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    if (!selectedResourceFile && resourceFormData.type !== "video") {
      toast.error("Please select a file to upload");
      return;
    }

    // Validate featured resources limit
    if (
      resourceFormData.featured &&
      resourceFormData.relatedResources.length > 3
    ) {
      toast.error("You can only feature up to 3 resources");
      return;
    }

    setIsUploading(true);

    // Add timeout to prevent hanging uploads
    const uploadTimeout = setTimeout(() => {
      setIsUploading(false);
      toast.error("Upload timed out. Please try again.");
    }, 30000); // 30 second timeout

    try {
      const response = await resourcesService.create(
        {
        ...resourceFormData,
          createdBy: "admin",
          fileUrl:
            resourceFormData.type === "video"
              ? resourceFormData.description
              : "",
        },
        selectedResourceFile || undefined
      );

      clearTimeout(uploadTimeout);
      
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Resource created successfully");
        setIsAddDialogOpen(false);
        resetResourceForm();
        await loadData();
      }
    } catch (error) {
      clearTimeout(uploadTimeout);
      console.error("Exception in handleAddResource:", error);
      toast.error("Failed to create resource");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditResource = async () => {
    if (!editingResource) return;
    
    // Validate required fields
    const missingFields = [];
    if (!resourceFormData.title) missingFields.push("Title");
    if (!resourceFormData.description) missingFields.push("Description");
    
    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    // Validate featured resources limit
    if (
      resourceFormData.featured &&
      resourceFormData.relatedResources.length > 3
    ) {
      toast.error("You can only feature up to 3 resources");
      return;
    }

    setIsUploading(true);

    // Add timeout to prevent hanging uploads
    const uploadTimeout = setTimeout(() => {
      setIsUploading(false);
      toast.error("Upload timed out. Please try again.");
    }, 30000); // 30 second timeout

    try {
      const response = await resourcesService.update(
        editingResource.id,
        {
        ...resourceFormData,
          fileUrl:
            resourceFormData.type === "video"
              ? resourceFormData.description
              : editingResource.fileUrl,
        },
        selectedResourceFile || undefined
      );

      clearTimeout(uploadTimeout);
      
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Resource updated successfully");
        setIsEditResourceDialogOpen(false);
        setEditingResource(null);
        resetResourceForm();
        await loadData();
      }
    } catch (error) {
      clearTimeout(uploadTimeout);
      console.error("Exception in handleEditResource:", error);
      toast.error("Failed to update resource");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteResource = (id: string) => {
    const resourceToDelete = resources.find((resource) => resource.id === id);
    if (resourceToDelete) {
      setDeleteItem({
        type: 'resource',
        id,
        title: resourceToDelete.title
      });
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDeleteResource = async () => {
    if (!deleteItem) return;
    
    try {
      const response = await resourcesService.delete(deleteItem.id);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Resource deleted successfully");
        loadData();
      }
    } catch (error) {
      console.error("Exception in handleDeleteResource:", error);
      toast.error("Failed to delete resource");
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteItem(null);
    }
  };

  const openEditResourceDialog = (resource: Resource) => {
    setEditingResource(resource);
    setResourceFormData({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      category: resource.category,
      isPublic: resource.isPublic,
      featured: resource.featured || false,
      tags: resource.tags || [],
      relatedResources: resource.relatedResources || [],
      thumbnailUrl: resource.thumbnailUrl || "",
    });
    setSelectedResourceFile(null);
    setIsEditResourceDialogOpen(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusBadge = (status: BlogPost["status"]) => {
    switch (status) {
      case "published":
        return <Badge variant="default" className="text-xs">Published</Badge>;
      case "draft":
        return <Badge variant="secondary" className="text-xs">Draft</Badge>;
      case "archived":
        return <Badge variant="outline" className="text-xs">Archived</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Draft</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  // Filter functions
  const clearResourceFilters = () => {
    setResourceTypeFilter("all");
    setResourceCategoryFilter("all");
    setResourceStatusFilter("all");
  };

  const clearBlogFilters = () => {
    setBlogCategoryFilter("all");
    setBlogStatusFilter("all");
  };

  const getFilteredResources = () => {
    let filtered = resources;

    // Apply type filter
    if (resourceTypeFilter !== "all") {
      filtered = filtered.filter(resource => resource.type === resourceTypeFilter);
    }

    // Apply category filter
    if (resourceCategoryFilter !== "all") {
      filtered = filtered.filter(resource => resource.category === resourceCategoryFilter);
    }

    // Apply status filter
    if (resourceStatusFilter !== "all") {
      if (resourceStatusFilter === "public") {
        filtered = filtered.filter(resource => resource.isPublic);
      } else if (resourceStatusFilter === "private") {
        filtered = filtered.filter(resource => !resource.isPublic);
      } else if (resourceStatusFilter === "featured") {
        filtered = filtered.filter(resource => resource.featured);
      }
    }

    return filtered;
  };

  const getFilteredPosts = () => {
    let filtered = posts;

    // Apply category filter
    if (blogCategoryFilter !== "all") {
      filtered = filtered.filter(post => post.category === blogCategoryFilter);
    }

    // Apply status filter
    if (blogStatusFilter !== "all") {
      if (blogStatusFilter === "published") {
        filtered = filtered.filter(post => post.status === "published");
      } else if (blogStatusFilter === "draft") {
        filtered = filtered.filter(post => post.status === "draft");
      } else if (blogStatusFilter === "archived") {
        filtered = filtered.filter(post => post.status === "archived");
      } else if (blogStatusFilter === "featured") {
        filtered = filtered.filter(post => post.featured);
      }
    }

    return filtered;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Content Management
          </h1>
          <Button disabled className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 animate-pulse"
                >
                  <div className="h-12 w-12 bg-gray-200 rounded"></div>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Content Management
          </h1>
          <p className="text-gray-600">
            Manage your blog posts and downloadable resources
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
                placeholder="Search content... (type 3+ characters or press Enter)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              className="pl-10"
            />
          </div>
            <Button
              onClick={() => setDebouncedSearchTerm(searchTerm)}
              disabled={isLoading}
              className="px-3 sm:px-6 whitespace-nowrap"
            >
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
          {searchTerm.length > 0 && searchTerm.length < 3 && (
            <p className="text-sm text-gray-500 mt-2">
              Type at least 3 characters or press Enter to search
            </p>
          )}
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="blogs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Blog Posts ({getFilteredPosts().length})
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Resources ({getFilteredResources().length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blogs" className="space-y-6">
          {/* Blog Posts Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Category Filter */}
              <div className="flex-1">
                <Label htmlFor="blog-category-filter" className="text-sm font-medium text-gray-700 mb-2 block">
                  Category
                </Label>
                <Select 
                  value={blogCategoryFilter} 
                  onValueChange={setBlogCategoryFilter}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="team-building">Team Building</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="strategy">Strategy</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="productivity">Productivity</SelectItem>
                    <SelectItem value="innovation">Innovation</SelectItem>
                    <SelectItem value="culture">Culture</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="flex-1">
                <Label htmlFor="blog-status-filter" className="text-sm font-medium text-gray-700 mb-2 block">
                  Status
                </Label>
                <Select 
                  value={blogStatusFilter} 
                  onValueChange={setBlogStatusFilter}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearBlogFilters}
                  className="h-10"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {/* No Data State */}
          {!isLoading && !error && getFilteredPosts().length === 0 && (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No blog posts found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm
                      ? "Try adjusting your search terms."
                      : "Get started by creating your first blog post."}
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="w-full sm:w-auto"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Post
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Blog Posts Grid */}
          {!isLoading && !error && getFilteredPosts().length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredPosts().map((post) => (
                <Card
                  key={post.id}
                  className={`overflow-hidden hover:shadow-lg transition-shadow ${
                    post.featured ? "border-2 border-primary/30" : ""
                  }`}
                >
                  {post.featuredImage && (
                    <div className="h-32 overflow-hidden relative">
                      <img 
                        src={post.featuredImage} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      {post.featured && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0 text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                  {!post.featuredImage && post.featured && (
                    <div className="relative">
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0 text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="outline" className="capitalize text-xs">
                        {post.category}
                      </Badge>
                      {getStatusBadge(post.status)}
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{post.authorName}</span>
                      </div>
                      {post.readTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{post.readTime} min read</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatDate(post.createdAt)}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openPreviewDialog(post)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(post)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          {/* Resources Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Resources</h2>
              <p className="text-gray-600">
                Manage downloadable resources and materials
              </p>
            </div>
            {/* Removed Add Resource Button here */}
          </div>

          {/* Resources Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Type Filter */}
              <div className="flex-1">
                <Label htmlFor="resource-type-filter" className="text-sm font-medium text-gray-700 mb-2 block">
                  Type
                </Label>
                <Select 
                  value={resourceTypeFilter} 
                  onValueChange={setResourceTypeFilter}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="docx">Document</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="whitepaper">Whitepaper</SelectItem>
                    <SelectItem value="template">Template</SelectItem>
                    <SelectItem value="toolkit">Toolkit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

              {/* Category Filter */}
              <div className="flex-1">
                <Label htmlFor="resource-category-filter" className="text-sm font-medium text-gray-700 mb-2 block">
                  Category
                </Label>
                <Select 
                  value={resourceCategoryFilter} 
                  onValueChange={setResourceCategoryFilter}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="team-building">Team Building</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="strategy">Strategy</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="productivity">Productivity</SelectItem>
                    <SelectItem value="innovation">Innovation</SelectItem>
                    <SelectItem value="culture">Culture</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

              {/* Status Filter */}
              <div className="flex-1">
                <Label htmlFor="resource-status-filter" className="text-sm font-medium text-gray-700 mb-2 block">
                  Status
                </Label>
                <Select 
                  value={resourceStatusFilter} 
                  onValueChange={setResourceStatusFilter}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                  <Button 
                  variant="outline"
                  onClick={clearResourceFilters}
                  className="h-10"
                >
                  Clear Filters
                  </Button>
              </div>
            </div>
          </div>

          {/* No Data State */}
          {!isLoading && !error && getFilteredResources().length === 0 && (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No resources found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm
                      ? "Try adjusting your search terms."
                      : "Get started by uploading your first resource."}
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="w-full sm:w-auto"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Upload Your First Resource
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resources Grid */}
          {!isLoading && !error && getFilteredResources().length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredResources().map((resource) => (
                <Card
                  key={resource.id}
                  className={`overflow-hidden hover:shadow-lg transition-shadow ${
                    resource.featured ? "border-2 border-primary/30" : ""
                  }`}
                >
                  {resource.thumbnailUrl && (
                    <div className="h-32 overflow-hidden relative">
                      <img 
                        src={resource.thumbnailUrl} 
                        alt={resource.title}
                        className="w-full h-full object-cover"
                      />
                      {resource.featured && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0 text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                  {!resource.thumbnailUrl && resource.featured && (
                    <div className="relative">
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0 text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="outline" className="capitalize text-xs">
                        {resource.type}
                      </Badge>
                      <Badge
                        variant={resource.isPublic ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {resource.isPublic ? "Public" : "Private"}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {resource.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {resource.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        <span>{resource.downloadCount} downloads</span>
                      </div>
                      {resource.fileSize && (
                        <div className="flex items-center gap-1">
                          <File className="h-3 w-3" />
                          <span>{formatFileSize(resource.fileSize)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatDate(resource.createdAt)}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(resource.fileUrl, "_blank")
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditResourceDialog(resource)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteResource(resource.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>
              Update the blog post details below.
            </DialogDescription>
          </DialogHeader>
                     <div className="grid gap-6 py-4">
             {/* Cover Image */}
             <div className="grid grid-cols-4 items-center gap-4">
               <Label className="text-right">Cover Image</Label>
               <div className="col-span-3 space-y-2">
                 <div className="flex gap-2">
                   <div className="flex-1 relative">
                     <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                     <Input
                       value={formData.featuredImage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          featuredImage: e.target.value,
                        })
                      }
                       className="pl-10"
                       placeholder="Enter image URL or upload a file"
                     />
                   </div>
                   <input
                     type="file"
                     accept="image/*"
                     onChange={async (e) => {
                       const file = e.target.files?.[0];
                       if (file) {
                         // Validate file type
                        if (!file.type.startsWith("image/")) {
                          toast.error("Please select a valid image file");
                           return;
                         }
                         
                         // Validate file size (5MB limit)
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
                          const downloadURL = await getDownloadURL(
                            snapshot.ref
                          );

                          setFormData({
                            ...formData,
                            featuredImage: downloadURL,
                          });
                          toast.success("Featured image uploaded successfully");
                         } catch (error) {
                          console.error(
                            "Error uploading featured image:",
                            error
                          );
                          toast.error("Failed to upload featured image");
                         } finally {
                           setIsUploading(false);
                         }
                       }
                       // Reset the input
                       if (e.target) {
                        e.target.value = "";
                       }
                     }}
                     className="hidden"
                     id="edit-featured-image-upload"
                   />
                   <Button 
                     variant="outline" 
                     size="sm"
                    onClick={() =>
                      document
                        .getElementById("edit-featured-image-upload")
                        ?.click()
                    }
                     disabled={isUploading}
                   >
                     {isUploading ? (
                       <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                     ) : (
                       <Upload className="h-4 w-4" />
                     )}
                   </Button>
                 </div>
                 {formData.featuredImage && (
                   <div className="mt-2">
                     <img 
                       src={formData.featuredImage} 
                       alt="Featured image preview" 
                       className="w-32 h-20 object-cover rounded border"
                     />
                   </div>
                 )}
               </div>
             </div>

             {/* Title */}
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Title *
              </Label>
               <Input
                 id="edit-title"
                 value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                 className="col-span-3"
                 placeholder="Enter your blog title"
               />
             </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-excerpt" className="text-right">
                Excerpt *
              </Label>
              <Textarea
                id="edit-excerpt"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                className="col-span-3"
                rows={3}
                placeholder="Write a brief summary of your blog"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-content" className="text-right pt-2">
                Content *
              </Label>
              <div className="col-span-3">
                <RichTextEditor
                  value={formData.content}
                  onChange={(content: string) =>
                    setFormData({ ...formData, content })
                  }
                  placeholder="Write your blog content here..."
                  className="min-h-[300px]"
                  onAutoSave={handleAutoSave}
                />
                {/* Auto-save Status */}
                {(isAutoSaving || lastAutoSaved) && (
                  <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
                    {isAutoSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                        <span>Auto-saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>
                          Last saved: {lastAutoSaved?.toLocaleTimeString()}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
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

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-tags" className="text-right">
                Tags
              </Label>
              <Input
                id="edit-tags"
                value={formData.tags.join(", ")}
                onChange={(e) =>
                  setFormData({
                  ...formData, 
                    tags: e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter((tag) => tag.length > 0),
                  })
                }
                className="col-span-3"
                placeholder="Add tags (comma separated)"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: BlogPost["status"]) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Featured Blog Post Toggle */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-blog-featured" className="text-right">
                Featured
              </Label>
              <div className="col-span-3 flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-blog-featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => {
                      const currentFeaturedCount = posts.filter((post) => post.featured).length;
                      const isAlreadyFeatured = posts.some((post) => post.featured && post.id === editingPost?.id);
                      
                      if (checked && currentFeaturedCount >= 3 && !isAlreadyFeatured) {
                        toast.error("Maximum of 3 featured blog posts allowed. Please unfeature another blog post first.");
                        return;
                      }
                      
                      setFormData({ ...formData, featured: checked as boolean });
                    }}
                    disabled={posts.filter((post) => post.featured).length >= 3 && !formData.featured}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="edit-blog-featured" className="text-sm">
                    Feature this blog post in the "Featured Blog Posts" section (max 3 featured blog posts)
                  </Label>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>
                    ({3 - posts.filter((post) => post.featured).length} featured
                    spots left)
                  </span>
                  {posts.filter((post) => post.featured).length >= 3 &&
                    !formData.featured && (
                      <span className="text-red-500 font-medium">
                        • Maximum featured blog posts reached. Remove a featured blog post to add this one.
                      </span>
                    )}
                </div>
              </div>
            </div>

            {/* Resources Selection */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Resources</Label>
              <div className="col-span-3 space-y-2">
                <div className="text-sm text-gray-600 mb-2">
                  Select resources from your database to include with this blog
                  post
                </div>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                  {resources.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-4">
                      No resources available. Create some resources first.
                    </div>
                  ) : (
                    resources.map((resource) => (
                      <label
                        key={resource.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                      >
                        <Checkbox
                          checked={formData.resources.includes(resource.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                resources: [...formData.resources, resource.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                resources: formData.resources.filter(
                                  (id) => id !== resource.id
                                ),
                              });
                            }
                          }}
                          className="h-4 w-4"
                        />
                        <span className="text-sm flex-1">{resource.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {resource.type}
                        </Badge>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* References */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">References</Label>
              <div className="col-span-3 space-y-2">
                <div className="text-sm text-gray-600 mb-2">
                  Add external references and links
                </div>
                {formData.references.map((reference, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Reference title"
                        value={reference.title}
                        onChange={(e) => {
                          const newReferences = [...formData.references];
                          newReferences[index].title = e.target.value;
                          setFormData({
                            ...formData,
                            references: newReferences,
                          });
                        }}
                      />
                      <Input
                        placeholder="URL"
                        value={reference.url}
                        onChange={(e) => {
                          const newReferences = [...formData.references];
                          newReferences[index].url = e.target.value;
                          setFormData({
                            ...formData,
                            references: newReferences,
                          });
                        }}
                      />
                      <Input
                        placeholder="Description (optional)"
                        value={reference.description || ""}
                        onChange={(e) => {
                          const newReferences = [...formData.references];
                          newReferences[index].description = e.target.value;
                          setFormData({
                            ...formData,
                            references: newReferences,
                          });
                        }}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newReferences = formData.references.filter(
                          (_, i) => i !== index
                        );
                        setFormData({ ...formData, references: newReferences });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      references: [
                        ...formData.references,
                        { title: "", url: "", description: "" },
                      ],
                    });
                  }}
                >
                  Add Reference
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleEditPost}
              disabled={isUploading}
            >
              {isUploading ? "Updating..." : "Update Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {previewPost ? `Preview: ${previewPost.title}` : "Post Preview"}
            </DialogTitle>
            <DialogDescription>
              {previewPost ? previewPost.excerpt : "Preview your blog post"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {previewPost && (
              <div className="prose max-w-none">
                {previewPost.featuredImage && (
                  <img 
                    src={previewPost.featuredImage} 
                    alt={previewPost.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h1>{previewPost.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <span>By {previewPost.authorName}</span>
                  <span>{formatDate(previewPost.createdAt)}</span>
                  {previewPost.readTime && (
                    <span>{previewPost.readTime} min read</span>
                  )}
                </div>
                <div className="flex items-center space-x-2 mb-4">
                  <Badge variant="outline">{previewPost.category}</Badge>
                  {previewPost.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div
                  dangerouslySetInnerHTML={{ __html: previewPost.content }}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPreviewDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Resource Dialog */}
      <Dialog
        open={isEditResourceDialogOpen}
        onOpenChange={setIsEditResourceDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
            <DialogDescription>
              Update the resource details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Resource Type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-resource-type" className="text-right">
                Type *
              </Label>
              <Select
                value={resourceFormData.type}
                onValueChange={(value: Resource["type"]) =>
                  setResourceFormData({ ...resourceFormData, type: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
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

            {/* Resource Category */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-resource-category" className="text-right">
                Category *
              </Label>
              <Select
                value={resourceFormData.category}
                onValueChange={(value: Resource["category"]) =>
                  setResourceFormData({ ...resourceFormData, category: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
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

            {/* Title */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-resource-title" className="text-right">
                Title *
              </Label>
              <Input
                id="edit-resource-title"
                value={resourceFormData.title}
                onChange={(e) =>
                  setResourceFormData({
                    ...resourceFormData,
                    title: e.target.value,
                  })
                }
                className="col-span-3"
                placeholder="Enter resource title"
              />
            </div>

            {/* Description */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label
                htmlFor="edit-resource-description"
                className="text-right pt-2"
              >
                Description *
              </Label>
              <Textarea
                id="edit-resource-description"
                value={resourceFormData.description}
                onChange={(e) =>
                  setResourceFormData({
                    ...resourceFormData,
                    description: e.target.value,
                  })
                }
                className="col-span-3"
                rows={3}
                placeholder="Enter resource description"
              />
            </div>

            {/* File Upload or Video URL */}
            {resourceFormData.type === "video" ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-video-url" className="text-right">
                  Video URL *
                </Label>
                <Input
                  id="edit-video-url"
                  value={resourceFormData.description}
                  onChange={(e) =>
                    setResourceFormData({
                      ...resourceFormData,
                      description: e.target.value,
                    })
                  }
                  className="col-span-3"
                  placeholder="Enter YouTube or video URL"
                />
              </div>
            ) : (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-resource-file" className="text-right">
                  File
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-resource-file"
                    type="file"
                    onChange={(e) =>
                      setSelectedResourceFile(e.target.files?.[0] || null)
                    }
                    accept={
                      resourceFormData.type === "pdf"
                        ? ".pdf"
                        : resourceFormData.type === "docx"
                        ? ".docx,.doc"
                        : resourceFormData.type === "image"
                        ? ".jpg,.jpeg,.png,.gif,.webp"
                        : resourceFormData.type === "audio"
                        ? ".mp3,.wav,.ogg,.m4a"
                        : "*"
                    }
                  />
                  {selectedResourceFile && (
                    <p className="text-sm text-gray-500 mt-1">
                      Selected: {selectedResourceFile.name} (
                      {formatFileSize(selectedResourceFile.size)})
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Leave empty to keep the current file
                  </p>
                </div>
              </div>
            )}

            {/* Resource Thumbnail URL */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-resource-thumbnail" className="text-right">
                Thumbnail URL
              </Label>
              <div className="col-span-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                      id="edit-resource-thumbnail"
                  value={resourceFormData.thumbnailUrl}
                      onChange={(e) =>
                        setResourceFormData({
                          ...resourceFormData,
                          thumbnailUrl: e.target.value,
                        })
                      }
                      className="pl-10"
                      placeholder="Enter image URL or upload a file"
                    />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Validate file type
                        if (!file.type.startsWith("image/")) {
                          toast.error("Please select a valid image file");
                          return;
                        }

                        // Validate file size (5MB limit)
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error("Image size must be less than 5MB");
                          return;
                        }

                        setIsUploading(true);
                        try {
                          const timestamp = Date.now();
                          const fileName = `resource-thumbnails/${timestamp}-${file.name}`;
                          const storageRef = ref(storage, fileName);

                          const snapshot = await uploadBytes(
                            storageRef,
                            file
                          );
                          const downloadURL = await getDownloadURL(
                            snapshot.ref
                          );

                          setResourceFormData({
                            ...resourceFormData,
                            thumbnailUrl: downloadURL,
                          });
                          toast.success(
                            "Thumbnail image uploaded successfully"
                          );
                        } catch (error) {
                          console.error(
                            "Error uploading thumbnail image:",
                            error
                          );
                          toast.error("Failed to upload thumbnail image");
                        } finally {
                          setIsUploading(false);
                        }
                      }
                      // Reset the input
                      if (e.target) {
                        e.target.value = "";
                      }
                    }}
                    className="hidden"
                    id="edit-resource-thumbnail-upload"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document
                        .getElementById("edit-resource-thumbnail-upload")
                        ?.click()
                    }
                    disabled={isUploading}
                    className="flex-shrink-0"
                  >
                    {isUploading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {resourceFormData.thumbnailUrl && (
                  <div className="mt-2">
                    <img 
                      src={resourceFormData.thumbnailUrl} 
                      alt="Resource thumbnail preview" 
                      className="w-32 h-20 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Featured Resource Toggle */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-resource-featured" className="text-right">
                Featured
              </Label>
              <div className="col-span-3 flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-resource-featured"
                    checked={resourceFormData.featured}
                    onCheckedChange={(checked) => {
                      const currentFeaturedCount = resources.filter((resource) => resource.featured).length;
                      const isAlreadyFeatured = resources.some((resource) => resource.featured && resource.id === editingResource?.id);
                      
                      if (checked && currentFeaturedCount >= 3 && !isAlreadyFeatured) {
                        toast.error("Maximum of 3 featured resources allowed. Please unfeature another resource first.");
                        return;
                      }
                      
                      setResourceFormData({
                        ...resourceFormData,
                        featured: checked as boolean,
                      });
                    }}
                    disabled={resources.filter((resource) => resource.featured).length >= 3 && !resourceFormData.featured}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="edit-resource-featured" className="text-sm">
                    Feature this resource in the "Featured Resources" section (max
                    3 featured resources)
                  </Label>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>
                    (
                    {3 -
                      resources.filter((resource) => resource.featured)
                        .length}{" "}
                    featured spots left)
                  </span>
                  {resources.filter((resource) => resource.featured).length >=
                    3 &&
                    !resourceFormData.featured && (
                      <span className="text-red-500 font-medium">
                        • Maximum featured resources reached. Remove a featured resource to add this one.
                      </span>
                  )}
                </div>
              </div>
            </div>

            {/* Related Resources Selection */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Related Resources</Label>
              <div className="col-span-3 space-y-2">
                <div className="text-sm text-gray-600 mb-2">
                  Select other resources that are related to this one (max 3
                  selections)
                </div>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                  {resources.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-4">
                      No other resources available.
                    </div>
                  ) : (
                    resources
                      .map((resource) => (
                        <label
                          key={resource.id}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                        >
                          <Checkbox
                            checked={resourceFormData.relatedResources.includes(
                              resource.id
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                if (
                                  resourceFormData.relatedResources.length >= 3
                                ) {
                                  toast.error(
                                    "You can only select up to 3 related resources"
                                  );
                                  return;
                                }
                                setResourceFormData({
                                  ...resourceFormData,
                                  relatedResources: [
                                    ...resourceFormData.relatedResources,
                                    resource.id,
                                  ],
                                });
                              } else {
                                setResourceFormData({
                                  ...resourceFormData,
                                  relatedResources:
                                    resourceFormData.relatedResources.filter(
                                      (id) => id !== resource.id
                                    ),
                                });
                              }
                            }}
                            className="h-4 w-4"
                          />
                          <span className="text-sm flex-1">
                            {resource.title}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {resource.type}
                          </Badge>
                        </label>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Public/Private */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-resource-public" className="text-right">
                Visibility
              </Label>
              <Select
                value={resourceFormData.isPublic ? "public" : "private"}
                onValueChange={(value) =>
                  setResourceFormData({
                    ...resourceFormData,
                    isPublic: value === "public",
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditResourceDialogOpen(false);
                setIsUploading(false);
                setEditingResource(null);
                resetResourceForm();
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleEditResource}
              disabled={isUploading}
            >
              {isUploading ? "Updating..." : "Update Resource"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Content Modal */}
      <CreateContentModal
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={async (_data, _file) => {
          if (contentType === "blog") {
            await handleAddPost();
          } else {
            await handleAddResource();
          }
        }}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteItem(null);
        }}
        onConfirm={deleteItem?.type === 'blog' ? confirmDeletePost : confirmDeleteResource}
        title={`Delete ${deleteItem?.type === 'blog' ? 'Blog Post' : 'Resource'}`}
        description={`Are you sure you want to delete "${deleteItem?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
} 
