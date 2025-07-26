'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Upload
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlogService } from '@/lib/services/BlogService';
import { ResourcesService } from '@/lib/services/ResourcesService';
import { toast } from 'sonner';
import type { BlogPost, Resource } from '@/shared/types/entities';
import dynamic from 'next/dynamic';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(
  () => import('@/components/ui/rich-text-editor').then(mod => mod.RichTextEditor),
  { ssr: false }
);

export default function ContentPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('blogs');
  const [contentType, setContentType] = useState<'blog' | 'resource'>('blog');
  
  // Resource management state
  const [isAddResourceDialogOpen, setIsAddResourceDialogOpen] = useState(false);
  const [isEditResourceDialogOpen, setIsEditResourceDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [selectedResourceFile, setSelectedResourceFile] = useState<File | null>(null);
  const [resourceFormData, setResourceFormData] = useState({
    title: '',
    description: '',
    type: 'pdf' as Resource['type'],
    category: 'leadership' as Resource['category'],
    isPublic: true,
    tags: [] as string[],
  });
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'leadership',
    tags: [] as string[],
    status: 'draft' as BlogPost['status'],
    author: 'admin',
    authorName: 'Kareem Payne',
    seoTitle: '',
    seoDescription: '',
    readTime: 0,
    featuredImage: '',
    resources: [] as string[], // Associated resource IDs
    references: [] as Array<{
      title: string;
      url: string;
      description?: string;
    }>, // External references/links
  });

  const blogService = new BlogService();
  const resourcesService = new ResourcesService();


  const categories = [
    'leadership',
    'team-building',
    'communication',
    'strategy',
    'management',
    'productivity',
    'innovation',
    'culture',
    'other'
  ];

  const resourceTypes = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'docx', label: 'Word Document' },
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio' },
    { value: 'article', label: 'Article' },
    { value: 'whitepaper', label: 'Whitepaper' },
    { value: 'template', label: 'Template' },
    { value: 'toolkit', label: 'Toolkit' },
  ];

  const resourceCategories = [
    { value: 'leadership', label: 'Leadership' },
    { value: 'team-building', label: 'Team Building' },
    { value: 'communication', label: 'Communication' },
    { value: 'strategy', label: 'Strategy' },
    { value: 'videos', label: 'Videos' },
    { value: 'articles', label: 'Articles' },
    { value: 'pdfs', label: 'PDFs' },
    { value: 'whitepapers', label: 'Whitepapers' },
    { value: 'other', label: 'Other' },
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
          resourcesService.getAll({ search: debouncedSearchTerm || undefined })
        ]);
        
        if (blogResponse.error) {
          setError(blogResponse.error);
        } else {
          setPosts(blogResponse.posts);
        }
        
        if (resourcesResponse.error) {
          console.error('Failed to load resources:', resourcesResponse.error);
        } else {
          setResources(resourcesResponse.resources);
        }
      } catch (_err) {
        console.error('Failed to search data:', _err);
        setError('Failed to search data');
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm]);

  // Handle Enter key press for immediate search
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
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
        resourcesService.getAll({}) // Load all resources without search filter
      ]);
      
      if (blogResponse.error) {
        setError(blogResponse.error);
      } else {
        setPosts(blogResponse.posts);
      }
      
      if (resourcesResponse.error) {
        console.error('Failed to load resources:', resourcesResponse.error);
      } else {
        setResources(resourcesResponse.resources);
      }
    } catch (_err) {
      console.error('Failed to load data:', _err);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };



  const openPreviewDialog = (post: BlogPost) => {
    setPreviewPost(post);
    setIsPreviewDialogOpen(true);
  };

  const handleAddPost = async () => {
    if (!formData.title || !formData.content || !formData.excerpt) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsUploading(true);
    try {
      const response = await blogService.create(formData, selectedImage || undefined);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Blog post created successfully");
        setIsAddDialogOpen(false);
        resetForm();
        await loadData();
      }
    } catch (_error) {
      console.error('Exception in handleAddPost:', _error);
      toast.error("Failed to create blog post");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditPost = async () => {
    if (!editingPost) return;
    
    if (!formData.title || !formData.content || !formData.excerpt) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsUploading(true);
    try {
      const response = await blogService.update(editingPost.id, formData, selectedImage || undefined);
      if (response.error) {
        toast.error(response.error);
      } else {
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

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
      const response = await blogService.delete(id);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Blog post deleted successfully");
        loadData();
      }
    } catch {
      toast.error("Failed to delete blog post");
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
      seoTitle: post.seoTitle || '',
      seoDescription: post.seoDescription || '',
      readTime: post.readTime || 0,
      featuredImage: post.featuredImage || '',
      resources: post.resources || [],
      references: post.references || [],
    });
    setSelectedImage(null);
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: 'leadership',
      tags: [],
      status: 'draft',
      author: 'admin',
      authorName: 'Kareem Payne',
      seoTitle: '',
      seoDescription: '',
      readTime: 0,
      featuredImage: '',
      resources: [],
      references: [],
    });
    setSelectedImage(null);
    setContentType('blog');
    resetResourceForm();
  };

  const resetResourceForm = () => {
    setResourceFormData({
      title: '',
      description: '',
      type: 'pdf',
      category: 'leadership',
      isPublic: true,
      tags: [],
    });
    setSelectedResourceFile(null);
  };

  const handleAddResource = async () => {
    if (!resourceFormData.title || !resourceFormData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!selectedResourceFile && resourceFormData.type !== 'video') {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    try {
      const response = await resourcesService.create({
        ...resourceFormData,
        createdBy: 'admin',
        fileUrl: resourceFormData.type === 'video' ? resourceFormData.description : '',
      }, selectedResourceFile || undefined);
      
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Resource created successfully");
        setIsAddResourceDialogOpen(false);
        resetResourceForm();
        await loadData();
      }
    } catch (error) {
      console.error('Exception in handleAddResource:', error);
      toast.error("Failed to create resource");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditResource = async () => {
    if (!editingResource) return;
    
    if (!resourceFormData.title || !resourceFormData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsUploading(true);
    try {
      const response = await resourcesService.update(editingResource.id, {
        ...resourceFormData,
        fileUrl: resourceFormData.type === 'video' ? resourceFormData.description : editingResource.fileUrl,
      }, selectedResourceFile || undefined);
      
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
      console.error('Exception in handleEditResource:', error);
      toast.error("Failed to update resource");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      const response = await resourcesService.delete(id);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Resource deleted successfully");
        loadData();
      }
    } catch (error) {
      console.error('Exception in handleDeleteResource:', error);
      toast.error("Failed to delete resource");
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
      tags: resource.tags || [],
    });
    setSelectedResourceFile(null);
    setIsEditResourceDialogOpen(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: BlogPost['status']) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const _formatTags = (tags: string[]) => {
    return tags.slice(0, 2).join(', ') + (tags.length > 2 ? ` +${tags.length - 2}` : '');
  };



  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600">Manage your blog posts and downloadable resources</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Content</DialogTitle>
              <DialogDescription>
                Choose the type of content you want to create.
              </DialogDescription>
            </DialogHeader>
            
            {/* Content Type Tabs */}
            <Tabs value={contentType} onValueChange={(value) => setContentType(value as 'blog' | 'resource')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="blog">Blog Post</TabsTrigger>
                <TabsTrigger value="resource">Resource</TabsTrigger>
              </TabsList>
              
              <TabsContent value="blog" className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Write and publish a new blog post with rich content editing.
                </div>
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
                        onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
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
                          if (!file.type.startsWith('image/')) {
                            toast.error('Please select a valid image file');
                            return;
                          }
                          
                          // Validate file size (5MB limit)
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error('Image size must be less than 5MB');
                            return;
                          }

                          setIsUploading(true);
                          try {
                            const timestamp = Date.now();
                            const fileName = `blog-featured-images/${timestamp}-${file.name}`;
                            const storageRef = ref(storage, fileName);
                            
                            const snapshot = await uploadBytes(storageRef, file);
                            const downloadURL = await getDownloadURL(snapshot.ref);
                            
                            setFormData({ ...formData, featuredImage: downloadURL });
                            toast.success('Featured image uploaded successfully');
                          } catch (error) {
                            console.error('Error uploading featured image:', error);
                            toast.error('Failed to upload featured image');
                          } finally {
                            setIsUploading(false);
                          }
                        }
                        // Reset the input
                        if (e.target) {
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                      id="featured-image-upload"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('featured-image-upload')?.click()}
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

              {/* Category */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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

              {/* Read Time */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="readTime" className="text-right">Read Time (minutes) *</Label>
                <Input
                  id="readTime"
                  type="number"
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                  placeholder="0"
                />
              </div>

              {/* Tags */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tags" className="text-right">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                  })}
                  className="col-span-3"
                  placeholder="Add tags (comma separated)"
                />
              </div>

              {/* Title */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter your blog title"
                />
              </div>
              
              {/* Excerpt */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="excerpt" className="text-right">Excerpt *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="col-span-3"
                  rows={3}
                  placeholder="Write a brief summary of your blog"
                />
              </div>

              {/* Rich Text Content */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="content" className="text-right pt-2">Content *</Label>
                <div className="col-span-3">
                  <RichTextEditor
                    value={formData.content}
                    onChange={(content: string) => setFormData({ ...formData, content })}
                    placeholder="Write your blog content here..."
                    className="min-h-[300px]"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select value={formData.status} onValueChange={(value: BlogPost['status']) => setFormData({ ...formData, status: value })}>
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

              {/* SEO Fields */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="seoTitle" className="text-right">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  className="col-span-3"
                  placeholder="SEO optimized title (optional)"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="seoDescription" className="text-right">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  className="col-span-3"
                  rows={2}
                  placeholder="SEO meta description (optional)"
                />
              </div>

              {/* Resources Selection */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Resources</Label>
                <div className="col-span-3 space-y-2">
                  <div className="text-sm text-gray-600 mb-2">
                    Select resources from your database to include with this blog post
                  </div>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                    {resources.length === 0 ? (
                      <div className="text-sm text-gray-500 text-center py-4">
                        No resources available. Create some resources first.
                      </div>
                    ) : (
                      resources.map((resource) => (
                        <label key={resource.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={formData.resources.includes(resource.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  resources: [...formData.resources, resource.id]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  resources: formData.resources.filter(id => id !== resource.id)
                                });
                              }
                            }}
                            className="rounded"
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
                            setFormData({ ...formData, references: newReferences });
                          }}
                        />
                        <Input
                          placeholder="URL"
                          value={reference.url}
                          onChange={(e) => {
                            const newReferences = [...formData.references];
                            newReferences[index].url = e.target.value;
                            setFormData({ ...formData, references: newReferences });
                          }}
                        />
                        <Input
                          placeholder="Description (optional)"
                          value={reference.description || ''}
                          onChange={(e) => {
                            const newReferences = [...formData.references];
                            newReferences[index].description = e.target.value;
                            setFormData({ ...formData, references: newReferences });
                          }}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newReferences = formData.references.filter((_, i) => i !== index);
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
                        references: [...formData.references, { title: '', url: '', description: '' }]
                      });
                    }}
                  >
                    Add Reference
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                onClick={handleAddPost}
                disabled={isUploading}
              >
                {isUploading ? 'Creating...' : 'Create Blog'}
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="resource" className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Upload and manage downloadable resources for your audience.
            </div>
            <div className="grid gap-6 py-4">
              {/* Resource Title */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="resourceTitle" className="text-right">Title *</Label>
                <Input
                  id="resourceTitle"
                  value={resourceFormData.title}
                  onChange={(e) => setResourceFormData({ ...resourceFormData, title: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter resource title"
                />
              </div>

              {/* Resource Description */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="resourceDescription" className="text-right pt-2">Description *</Label>
                <Textarea
                  id="resourceDescription"
                  value={resourceFormData.description}
                  onChange={(e) => setResourceFormData({ ...resourceFormData, description: e.target.value })}
                  className="col-span-3"
                  rows={3}
                  placeholder="Describe the resource"
                />
              </div>

              {/* Resource Type */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="resourceType" className="text-right">Type *</Label>
                <Select value={resourceFormData.type} onValueChange={(value) => setResourceFormData({ ...resourceFormData, type: value as Resource['type'] })}>
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
                <Label htmlFor="resourceCategory" className="text-right">Category *</Label>
                <Select value={resourceFormData.category} onValueChange={(value) => setResourceFormData({ ...resourceFormData, category: value as Resource['category'] })}>
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

              {/* Resource File Upload */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="resourceFile" className="text-right">File *</Label>
                <div className="col-span-3">
                  <Input
                    id="resourceFile"
                    type="file"
                    onChange={(e) => setSelectedResourceFile(e.target.files?.[0] || null)}
                    className="col-span-3"
                  />
                  {selectedResourceFile && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {selectedResourceFile.name} ({formatFileSize(selectedResourceFile.size)})
                    </p>
                  )}
                </div>
              </div>

              {/* Resource Tags */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="resourceTags" className="text-right">Tags</Label>
                <Input
                  id="resourceTags"
                  value={resourceFormData.tags.join(', ')}
                  onChange={(e) => setResourceFormData({ 
                    ...resourceFormData, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                  })}
                  className="col-span-3"
                  placeholder="Add tags (comma separated)"
                />
              </div>

              {/* Public/Private Toggle */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="resourcePublic" className="text-right">Public Access</Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <input
                    id="resourcePublic"
                    type="checkbox"
                    checked={resourceFormData.isPublic}
                    onChange={(e) => setResourceFormData({ ...resourceFormData, isPublic: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="resourcePublic" className="text-sm">
                    Make this resource publicly accessible
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                onClick={handleAddResource}
                disabled={isUploading}
              >
                {isUploading ? 'Creating...' : 'Create Resource'}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
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
          <div className="flex gap-2">
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
              className="px-6"
            >
              {isLoading ? 'Searching...' : 'Search'}
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="blogs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Blog Posts ({posts.length})
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Resources ({resources.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blogs" className="space-y-6">
          {/* No Data State */}
          {!isLoading && !error && posts.length === 0 && (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first blog post.'}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Post
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Blog Posts Grid */}
          {!isLoading && !error && posts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {post.featuredImage && (
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={post.featuredImage} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="capitalize">
                        {post.category}
                      </Badge>
                      {getStatusBadge(post.status)}
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                    
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
                      <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openPreviewDialog(post)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(post)}>
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
              <p className="text-gray-600">Manage downloadable resources and materials</p>
            </div>
            <Dialog open={isAddResourceDialogOpen} onOpenChange={setIsAddResourceDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsAddResourceDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Resource</DialogTitle>
                  <DialogDescription>
                    Upload a new resource file or add a video link.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  {/* Resource Type */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="resource-type" className="text-right">Type *</Label>
                    <Select value={resourceFormData.type} onValueChange={(value: Resource['type']) => setResourceFormData({ ...resourceFormData, type: value })}>
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
                    <Label htmlFor="resource-category" className="text-right">Category *</Label>
                    <Select value={resourceFormData.category} onValueChange={(value: Resource['category']) => setResourceFormData({ ...resourceFormData, category: value })}>
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
                    <Label htmlFor="resource-title" className="text-right">Title *</Label>
                    <Input
                      id="resource-title"
                      value={resourceFormData.title}
                      onChange={(e) => setResourceFormData({ ...resourceFormData, title: e.target.value })}
                      className="col-span-3"
                      placeholder="Enter resource title"
                    />
                  </div>

                  {/* Description */}
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="resource-description" className="text-right pt-2">Description *</Label>
                    <Textarea
                      id="resource-description"
                      value={resourceFormData.description}
                      onChange={(e) => setResourceFormData({ ...resourceFormData, description: e.target.value })}
                      className="col-span-3"
                      rows={3}
                      placeholder="Enter resource description"
                    />
                  </div>

                  {/* File Upload or Video URL */}
                  {resourceFormData.type === 'video' ? (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="video-url" className="text-right">Video URL *</Label>
                      <Input
                        id="video-url"
                        value={resourceFormData.description}
                        onChange={(e) => setResourceFormData({ ...resourceFormData, description: e.target.value })}
                        className="col-span-3"
                        placeholder="Enter YouTube or video URL"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="resource-file" className="text-right">File *</Label>
                      <div className="col-span-3">
                        <Input
                          id="resource-file"
                          type="file"
                          onChange={(e) => setSelectedResourceFile(e.target.files?.[0] || null)}
                          accept={resourceFormData.type === 'pdf' ? '.pdf' : 
                                 resourceFormData.type === 'docx' ? '.docx,.doc' :
                                 resourceFormData.type === 'image' ? '.jpg,.jpeg,.png,.gif,.webp' :
                                 resourceFormData.type === 'audio' ? '.mp3,.wav,.ogg,.m4a' : '*'}
                        />
                        {selectedResourceFile && (
                          <p className="text-sm text-gray-500 mt-1">
                            Selected: {selectedResourceFile.name} ({formatFileSize(selectedResourceFile.size)})
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="resource-tags" className="text-right">Tags</Label>
                    <Input
                      id="resource-tags"
                      value={resourceFormData.tags.join(', ')}
                      onChange={(e) => setResourceFormData({ 
                        ...resourceFormData, 
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                      })}
                      className="col-span-3"
                      placeholder="Add tags (comma separated)"
                    />
                  </div>

                  {/* Public/Private */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="resource-public" className="text-right">Visibility</Label>
                    <Select value={resourceFormData.isPublic ? 'public' : 'private'} onValueChange={(value) => setResourceFormData({ ...resourceFormData, isPublic: value === 'public' })}>
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
                  <Button variant="outline" onClick={() => setIsAddResourceDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    onClick={handleAddResource}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Add Resource'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* No Data State */}
          {!isLoading && !error && resources.length === 0 && (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Get started by uploading your first resource.'}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setIsAddResourceDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Upload Your First Resource
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resources Grid */}
          {!isLoading && !error && resources.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <Card key={resource.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {resource.thumbnailUrl && (
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={resource.thumbnailUrl} 
                        alt={resource.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="capitalize">
                        {resource.type}
                      </Badge>
                      <Badge variant={resource.isPublic ? "default" : "secondary"}>
                        {resource.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{resource.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{resource.description}</p>
                    
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
                      <span className="text-xs text-gray-500">{formatDate(resource.createdAt)}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(resource.fileUrl, '_blank')}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditResourceDialog(resource)}>
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
                       onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
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
                         if (!file.type.startsWith('image/')) {
                           toast.error('Please select a valid image file');
                           return;
                         }
                         
                         // Validate file size (5MB limit)
                         if (file.size > 5 * 1024 * 1024) {
                           toast.error('Image size must be less than 5MB');
                           return;
                         }

                         setIsUploading(true);
                         try {
                           const timestamp = Date.now();
                           const fileName = `blog-featured-images/${timestamp}-${file.name}`;
                           const storageRef = ref(storage, fileName);
                           
                           const snapshot = await uploadBytes(storageRef, file);
                           const downloadURL = await getDownloadURL(snapshot.ref);
                           
                           setFormData({ ...formData, featuredImage: downloadURL });
                           toast.success('Featured image uploaded successfully');
                         } catch (error) {
                           console.error('Error uploading featured image:', error);
                           toast.error('Failed to upload featured image');
                         } finally {
                           setIsUploading(false);
                         }
                       }
                       // Reset the input
                       if (e.target) {
                         e.target.value = '';
                       }
                     }}
                     className="hidden"
                     id="edit-featured-image-upload"
                   />
                   <Button 
                     variant="outline" 
                     size="sm"
                     onClick={() => document.getElementById('edit-featured-image-upload')?.click()}
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
               <Label htmlFor="edit-title" className="text-right">Title *</Label>
               <Input
                 id="edit-title"
                 value={formData.title}
                 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                 className="col-span-3"
                 placeholder="Enter your blog title"
               />
             </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-excerpt" className="text-right">Excerpt *</Label>
              <Textarea
                id="edit-excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="col-span-3"
                rows={3}
                placeholder="Write a brief summary of your blog"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-content" className="text-right pt-2">Content *</Label>
              <div className="col-span-3">
                <RichTextEditor
                  value={formData.content}
                  onChange={(content: string) => setFormData({ ...formData, content })}
                  placeholder="Write your blog content here..."
                  className="min-h-[300px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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
              <Label htmlFor="edit-tags" className="text-right">Tags</Label>
              <Input
                id="edit-tags"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                })}
                className="col-span-3"
                placeholder="Add tags (comma separated)"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">Status</Label>
              <Select value={formData.status} onValueChange={(value: BlogPost['status']) => setFormData({ ...formData, status: value })}>
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

            {/* Resources Selection */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Resources</Label>
              <div className="col-span-3 space-y-2">
                <div className="text-sm text-gray-600 mb-2">
                  Select resources from your database to include with this blog post
                </div>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                  {resources.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-4">
                      No resources available. Create some resources first.
                    </div>
                  ) : (
                    resources.map((resource) => (
                      <label key={resource.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={formData.resources.includes(resource.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                resources: [...formData.resources, resource.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                resources: formData.resources.filter(id => id !== resource.id)
                              });
                            }
                          }}
                          className="rounded"
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
                          setFormData({ ...formData, references: newReferences });
                        }}
                      />
                      <Input
                        placeholder="URL"
                        value={reference.url}
                        onChange={(e) => {
                          const newReferences = [...formData.references];
                          newReferences[index].url = e.target.value;
                          setFormData({ ...formData, references: newReferences });
                        }}
                      />
                      <Input
                        placeholder="Description (optional)"
                        value={reference.description || ''}
                        onChange={(e) => {
                          const newReferences = [...formData.references];
                          newReferences[index].description = e.target.value;
                          setFormData({ ...formData, references: newReferences });
                        }}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newReferences = formData.references.filter((_, i) => i !== index);
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
                      references: [...formData.references, { title: '', url: '', description: '' }]
                    });
                  }}
                >
                  Add Reference
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleEditPost}
              disabled={isUploading}
            >
              {isUploading ? 'Updating...' : 'Update Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {previewPost ? `Preview: ${previewPost.title}` : 'Post Preview'}
            </DialogTitle>
            <DialogDescription>
              {previewPost ? previewPost.excerpt : 'Preview your blog post'}
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
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
                <div dangerouslySetInnerHTML={{ __html: previewPost.content }} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Resource Dialog */}
      <Dialog open={isEditResourceDialogOpen} onOpenChange={setIsEditResourceDialogOpen}>
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
              <Label htmlFor="edit-resource-type" className="text-right">Type *</Label>
              <Select value={resourceFormData.type} onValueChange={(value: Resource['type']) => setResourceFormData({ ...resourceFormData, type: value })}>
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
              <Label htmlFor="edit-resource-category" className="text-right">Category *</Label>
              <Select value={resourceFormData.category} onValueChange={(value: Resource['category']) => setResourceFormData({ ...resourceFormData, category: value })}>
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
              <Label htmlFor="edit-resource-title" className="text-right">Title *</Label>
              <Input
                id="edit-resource-title"
                value={resourceFormData.title}
                onChange={(e) => setResourceFormData({ ...resourceFormData, title: e.target.value })}
                className="col-span-3"
                placeholder="Enter resource title"
              />
            </div>

            {/* Description */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-resource-description" className="text-right pt-2">Description *</Label>
              <Textarea
                id="edit-resource-description"
                value={resourceFormData.description}
                onChange={(e) => setResourceFormData({ ...resourceFormData, description: e.target.value })}
                className="col-span-3"
                rows={3}
                placeholder="Enter resource description"
              />
            </div>

            {/* File Upload or Video URL */}
            {resourceFormData.type === 'video' ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-video-url" className="text-right">Video URL *</Label>
                <Input
                  id="edit-video-url"
                  value={resourceFormData.description}
                  onChange={(e) => setResourceFormData({ ...resourceFormData, description: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter YouTube or video URL"
                />
              </div>
            ) : (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-resource-file" className="text-right">File</Label>
                <div className="col-span-3">
                  <Input
                    id="edit-resource-file"
                    type="file"
                    onChange={(e) => setSelectedResourceFile(e.target.files?.[0] || null)}
                    accept={resourceFormData.type === 'pdf' ? '.pdf' : 
                           resourceFormData.type === 'docx' ? '.docx,.doc' :
                           resourceFormData.type === 'image' ? '.jpg,.jpeg,.png,.gif,.webp' :
                           resourceFormData.type === 'audio' ? '.mp3,.wav,.ogg,.m4a' : '*'}
                  />
                  {selectedResourceFile && (
                    <p className="text-sm text-gray-500 mt-1">
                      Selected: {selectedResourceFile.name} ({formatFileSize(selectedResourceFile.size)})
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Leave empty to keep the current file
                  </p>
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-resource-tags" className="text-right">Tags</Label>
              <Input
                id="edit-resource-tags"
                value={resourceFormData.tags.join(', ')}
                onChange={(e) => setResourceFormData({ 
                  ...resourceFormData, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                })}
                className="col-span-3"
                placeholder="Add tags (comma separated)"
              />
            </div>

            {/* Public/Private */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-resource-public" className="text-right">Visibility</Label>
              <Select value={resourceFormData.isPublic ? 'public' : 'private'} onValueChange={(value) => setResourceFormData({ ...resourceFormData, isPublic: value === 'public' })}>
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
            <Button variant="outline" onClick={() => setIsEditResourceDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleEditResource}
              disabled={isUploading}
            >
              {isUploading ? 'Updating...' : 'Update Resource'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 