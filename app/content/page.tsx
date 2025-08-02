'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Calendar,
  Clock,
  ArrowRight,
  Download,
  FileText,
  Video,
  BookOpen,
  Star,
  Grid,
  List,
  Image as ImageIcon,
  Music,
  File
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BlogPost, Resource } from '@/shared/types/entities';
import Footer from '@/components/Footer';
import ResourceDownloadModal from '@/components/ResourceDownloadModal';
import AuthModal from '@/components/AuthModal';
import { BlogService } from '@/lib/services/BlogService';
import { ResourcesService } from '@/lib/services/ResourcesService';
import { useAuth } from '@/hooks/useAuth';

const categoryLabels: Record<string, string> = {
  'leadership': 'Leadership',
  'team-building': 'Team Building',
  'strategy': 'Strategy',
  'communication': 'Communication',
  'management': 'Management',
  'productivity': 'Productivity',
  'innovation': 'Innovation',
  'culture': 'Culture',
  'other': 'Other'
};

const typeLabels: Record<string, string> = {
  'pdf': 'PDF',
  'video': 'Video',
  'article': 'Article',
  'whitepaper': 'Whitepaper',
  'template': 'Template',
  'audio': 'Audio',
  'image': 'Image',
  'other': 'Other'
};

export default function ContentPage() {
  const { isAuthenticated } = useAuth();
  
  // Blog Posts State
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [filteredBlogPosts, setFilteredBlogPosts] = useState<BlogPost[]>([]);
  const [blogSearchTerm, setBlogSearchTerm] = useState('');
  const [selectedBlogCategory, setSelectedBlogCategory] = useState<string>('all');
  const [blogViewMode, setBlogViewMode] = useState<'grid' | 'list'>('grid');

  // Resources State
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [resourceSearchTerm, setResourceSearchTerm] = useState('');
  const [selectedResourceCategory, setSelectedResourceCategory] = useState<string>('all');
  const [selectedResourceType, setSelectedResourceType] = useState<string>('all');
  const [resourceViewMode, setResourceViewMode] = useState<'grid' | 'list'>('grid');

  // Loading States
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);
  const [isLoadingResources, setIsLoadingResources] = useState(true);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  // Modal State
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalContext, setAuthModalContext] = useState<{
    title: string;
    description: string;
    onSuccess: () => void;
  } | null>(null);

  useEffect(() => {
    loadBlogPosts();
    loadResources();
  }, []);

  useEffect(() => {
    filterBlogPosts();
  }, [blogPosts, blogSearchTerm, selectedBlogCategory]);

  useEffect(() => {
    filterResources();
  }, [resources, resourceSearchTerm, selectedResourceCategory, selectedResourceType]);

  // Replace API fetches with direct service calls
  const loadBlogPosts = async () => {
    setIsLoadingBlogs(true);
    try {
      const blogService = new BlogService();
      const response = await blogService.getAll({ status: 'published' });
      if (response.error) {
        console.error('Failed to load blog posts:', response.error);
        setBlogPosts([]);
      } else {
        // Ensure all date fields are Date objects
        const posts = response.posts.map(post => ({
          ...post,
          createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt),
          updatedAt: post.updatedAt instanceof Date ? post.updatedAt : new Date(post.updatedAt),
          publishedAt: post.publishedAt ? (post.publishedAt instanceof Date ? post.publishedAt : new Date(post.publishedAt)) : undefined,
        }));
        setBlogPosts(posts);
      }
    } catch (error) {
      console.error('Error loading blog posts:', error);
      setBlogPosts([]);
    } finally {
      setIsLoadingBlogs(false);
    }
  };

  const loadResources = async () => {
    setIsLoadingResources(true);
    try {
      const resourcesService = new ResourcesService();
      const response = await resourcesService.getAll({ isPublic: true });
      if (response.error) {
        console.error('Failed to load resources:', response.error);
        setResources([]);
      } else {
        // Ensure all date fields are Date objects
        const resources = response.resources.map(resource => ({
          ...resource,
          createdAt: resource.createdAt instanceof Date ? resource.createdAt : new Date(resource.createdAt),
          updatedAt: resource.updatedAt instanceof Date ? resource.updatedAt : new Date(resource.updatedAt),
        }));
        setResources(resources);
      }
    } catch (error) {
      console.error('Error loading resources:', error);
      setResources([]);
    } finally {
      setIsLoadingResources(false);
    }
  };

  const filterBlogPosts = () => {
    let filtered = blogPosts;

    if (blogSearchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(blogSearchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(blogSearchTerm.toLowerCase()) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(blogSearchTerm.toLowerCase())))
      );
    }

    if (selectedBlogCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedBlogCategory);
    }

    setFilteredBlogPosts(filtered);
  };

  const filterResources = () => {
    let filtered = resources;

    if (resourceSearchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(resourceSearchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(resourceSearchTerm.toLowerCase()) ||
        (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(resourceSearchTerm.toLowerCase())))
      );
    }

    if (selectedResourceCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedResourceCategory);
    }

    if (selectedResourceType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedResourceType);
    }

    setFilteredResources(filtered);
  };

  const handleViewPost = (slug: string) => {
    if (!isAuthenticated) {
      setAuthModalContext({
        title: 'Sign in to read blog posts',
        description: 'Please sign in or create an account to read our blog posts and access exclusive content.',
        onSuccess: () => window.open(`/blog/${slug}`, '_blank')
      });
      setIsAuthModalOpen(true);
      return;
    }
    window.open(`/blog/${slug}`, '_blank');
  };

  const handleDownloadClick = (resourceId: string) => {
    if (!isAuthenticated) {
      const resource = resources.find(r => r.id === resourceId);
      setAuthModalContext({
        title: 'Sign in to download resources',
        description: `Please sign in or create an account to download "${resource?.title || 'this resource'}" and access our content library.`,
        onSuccess: () => {
          const resource = resources.find(r => r.id === resourceId);
          if (resource) {
            setSelectedResource(resource);
            setIsModalOpen(true);
          }
        }
      });
      setIsAuthModalOpen(true);
      return;
    }
    
    const resource = resources.find(r => r.id === resourceId);
    if (resource) {
      setSelectedResource(resource);
      setIsModalOpen(true);
    }
  };

  const handleDownload = async (resourceId: string) => {
    try {
      const resource = resources.find(r => r.id === resourceId);
      if (resource?.fileUrl) {
        // Increment download count via API
        try {
          const response = await fetch(`/api/content/resources/${resourceId}/download`, {
            method: 'POST',
          });
          
          if (response.ok) {
            // Update local state
            setResources(prev => prev.map(r => 
              r.id === resourceId 
                ? { ...r, downloadCount: r.downloadCount + 1 }
                : r
            ));
          }
        } catch (error) {
          console.error('Error incrementing download count:', error);
        }
        
        // Open download link
        window.open(resource.fileUrl, '_blank');
      }
    } catch (error) {
      console.error('Error downloading resource:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedResource(null);
  };

  const toggleDescription = (resourceId: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resourceId)) {
        newSet.delete(resourceId);
      } else {
        newSet.add(resourceId);
      }
      return newSet;
    });
  };

  const truncateDescription = (description: string, resourceId: string) => {
    const isExpanded = expandedDescriptions.has(resourceId);
    if (isExpanded) return description;
    return description.length > 120 ? description.substring(0, 120) + '...' : description;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'article': return <BookOpen className="h-4 w-4" />;
      case 'whitepaper': return <File className="h-4 w-4" />;
      case 'template': return <FileText className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      case 'image': return <ImageIcon className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Content Library
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our collection of blog posts and resources designed to help you excel in leadership, team building, and professional development.
          </p>
        </div>

        <Tabs defaultValue="blog" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="blog" className="text-lg">
              <FileText className="h-5 w-5 mr-2" />
              Blog Posts
            </TabsTrigger>
            <TabsTrigger value="resources" className="text-lg">
              <Download className="h-5 w-5 mr-2" />
              Resources
            </TabsTrigger>
          </TabsList>

          {/* Blog Posts Tab */}
          <TabsContent value="blog" className="space-y-6">
            {/* Blog Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search blog posts..."
                  value={blogSearchTerm}
                  onChange={(e) => setBlogSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedBlogCategory} onValueChange={setSelectedBlogCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant={blogViewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBlogViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={blogViewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBlogViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Blog Posts Grid/List */}
            {isLoadingBlogs ? (
              <div className={blogViewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className={blogViewMode === 'grid' ? 'h-80' : 'h-32'} />
                ))}
              </div>
            ) : filteredBlogPosts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div className={blogViewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredBlogPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {post.featuredImage && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">{categoryLabels[post.category] || post.category}</Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {post.publishedAt?.toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {post.readTime || 5} min read
                        </span>
                      </div>
                      <Button 
                        onClick={() => handleViewPost(post.slug)}
                        className="w-full"
                      >
                        Read More
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

                     {/* Resources Tab */}
           <TabsContent value="resources" className="space-y-6">
             {/* Resources Search and Filters */}
             <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
               <div className="flex flex-col lg:flex-row gap-6">
                 {/* Search */}
                 <div className="flex-1">
                   <div className="relative">
                     <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                     <Input
                       placeholder="Search resources..."
                       value={resourceSearchTerm}
                       onChange={(e) => setResourceSearchTerm(e.target.value)}
                       className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-primary rounded-xl"
                     />
                   </div>
                 </div>

                 {/* Category Filter */}
                 <Select value={selectedResourceCategory} onValueChange={setSelectedResourceCategory}>
                   <SelectTrigger className="w-full lg:w-48 h-12 border-2 border-gray-200 focus:border-primary rounded-xl">
                     <SelectValue placeholder="All Categories" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All Categories</SelectItem>
                     {Object.entries(categoryLabels).map(([value, label]) => (
                       <SelectItem key={value} value={value}>
                         {label}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>

                 {/* Type Filter */}
                 <Select value={selectedResourceType} onValueChange={setSelectedResourceType}>
                   <SelectTrigger className="w-full lg:w-48 h-12 border-2 border-gray-200 focus:border-primary rounded-xl">
                     <SelectValue placeholder="All Types" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All Types</SelectItem>
                     {Object.entries(typeLabels).map(([value, label]) => (
                       <SelectItem key={value} value={value}>
                         {label}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>

                 {/* View Toggle */}
                 <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden">
                   <Button
                     variant={resourceViewMode === 'grid' ? 'default' : 'ghost'}
                     size="sm"
                     onClick={() => setResourceViewMode('grid')}
                     className="rounded-r-none h-12 px-4"
                   >
                     <Grid className="w-5 h-5" />
                   </Button>
                   <Button
                     variant={resourceViewMode === 'list' ? 'default' : 'ghost'}
                     size="sm"
                     onClick={() => setResourceViewMode('list')}
                     className="rounded-l-none h-12 px-4"
                   >
                     <List className="w-5 h-5" />
                   </Button>
                 </div>
               </div>
             </div>

             {/* Featured Resources */}
             {filteredResources.filter(r => r.featured).length > 0 && (
               <div className="mb-16">
                 <div className="flex items-center gap-3 mb-8">
                   <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                     <Star className="w-6 h-6 text-white" />
                   </div>
                   <div>
                     <h2 className="text-3xl font-bold text-gray-900">Featured Resources</h2>
                     <p className="text-gray-600">Our most popular and valuable content</p>
                   </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {filteredResources.filter(r => r.featured).map((resource) => (
                     <Card key={resource.id} className="resource-card group hover:shadow-2xl transition-all duration-300 border-2 border-yellow-200 hover:border-yellow-300 overflow-hidden">
                       <div className="relative h-48 bg-gradient-to-br from-yellow-50 to-orange-50">
                         <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"></div>
                         <div className="absolute top-4 left-4">
                           <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                             Featured
                           </Badge>
                         </div>
                         <div className="absolute top-4 right-4">
                           <div className="w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center">
                             {getTypeIcon(resource.type)}
                           </div>
                         </div>
                         <div className="absolute bottom-4 left-4 right-4">
                           <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                             {resource.title}
                           </h3>
                         </div>
                       </div>
                       <CardContent className="p-6">
                         <p className="text-gray-600 mb-4">
                           {truncateDescription(resource.description, resource.id)}
                         </p>
                         {resource.description.length > 120 && (
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => toggleDescription(resource.id)}
                             className="p-0 h-auto text-primary hover:text-primary/80 mb-4"
                           >
                             {expandedDescriptions.has(resource.id) ? 'Read Less' : 'Read More'}
                           </Button>
                         )}
                         <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                           <span className="flex items-center gap-1">
                             <Download className="w-4 h-4" />
                             {resource.downloadCount.toLocaleString()} downloads
                           </span>
                           <span className="flex items-center gap-1">
                             <Calendar className="w-4 h-4" />
                             {resource.createdAt.toLocaleDateString()}
                           </span>
                         </div>
                         <div className="flex flex-wrap gap-2 mb-4">
                           {resource.tags?.slice(0, 3).map((tag) => (
                             <Badge key={tag} variant="outline" className="text-xs">
                               {tag}
                             </Badge>
                           ))}
                         </div>
                         <Button 
                           onClick={() => handleDownloadClick(resource.id)}
                           className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white border-0 h-12 rounded-xl"
                         >
                           <Download className="w-5 h-5 mr-2" />
                           Download Now
                         </Button>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               </div>
             )}

             {/* All Resources */}
             <div>
               <div className="flex items-center justify-between mb-8">
                 <div>
                   <h2 className="text-3xl font-bold text-gray-900">
                     All Resources
                   </h2>
                   <p className="text-gray-600 mt-2">
                     {filteredResources.filter(r => !r.featured).length} resources available
                   </p>
                 </div>
               </div>

               {isLoadingResources ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                   {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                     <Skeleton key={i} className="h-80" />
                   ))}
                 </div>
               ) : filteredResources.filter(r => !r.featured).length === 0 ? (
                 <div className="text-center py-12">
                   <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                   <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
                   <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                   {filteredResources.filter(r => !r.featured).map((resource) => (
                     <Card key={resource.id} className="resource-card group hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30 overflow-hidden">
                       <div className="relative h-40 bg-gradient-to-br from-gray-50 to-blue-50">
                         <div className="absolute top-4 left-4">
                           <Badge variant="secondary" className="text-xs">
                             {typeLabels[resource.type]}
                           </Badge>
                         </div>
                         <div className="absolute top-4 right-4">
                           <div className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center">
                             {getTypeIcon(resource.type)}
                           </div>
                         </div>
                       </div>
                       <CardContent className="p-6">
                         <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                           {resource.title}
                         </h3>
                         <p className="text-gray-600 text-sm mb-4">
                           {truncateDescription(resource.description, resource.id)}
                         </p>
                         {resource.description.length > 120 && (
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => toggleDescription(resource.id)}
                             className="p-0 h-auto text-primary hover:text-primary/80 mb-4"
                           >
                             {expandedDescriptions.has(resource.id) ? 'Read Less' : 'Read More'}
                           </Button>
                         )}
                         <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                           <span className="flex items-center gap-1">
                             <Download className="w-4 h-4" />
                             {resource.downloadCount.toLocaleString()} downloads
                           </span>
                           <span className="flex items-center gap-1">
                             <Calendar className="w-4 h-4" />
                             {resource.createdAt.toLocaleDateString()}
                           </span>
                         </div>
                         <div className="flex flex-wrap gap-2 mb-4">
                           {resource.tags?.slice(0, 2).map((tag) => (
                             <Badge key={tag} variant="outline" className="text-xs">
                               {tag}
                             </Badge>
                           ))}
                         </div>
                         <Button 
                           onClick={() => handleDownloadClick(resource.id)}
                           className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white border-0 h-12 rounded-xl"
                         >
                           <Download className="w-5 h-5 mr-2" />
                           Download Now
                         </Button>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               )}
             </div>
           </TabsContent>
        </Tabs>
      </div>

      <Footer />

      {/* Resource Download Modal */}
      <ResourceDownloadModal
        resource={selectedResource}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDownload={handleDownload}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthModalContext(null);
        }}
        onSuccess={authModalContext?.onSuccess}
        title={authModalContext?.title}
        description={authModalContext?.description}
      />
    </div>
  );
} 