'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
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
import ResourceDownloadModal from '@/components/ResourceDownloadModal';
import AuthModal from '@/components/AuthModal';
import { BlogService } from '@/lib/services/BlogService';
import { ResourcesService } from '@/lib/services/ResourcesService';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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

const typeIcons: Record<string, React.ReactNode> = {
  'pdf': <FileText className="w-4 h-4" />,
  'video': <Video className="w-4 h-4" />,
  'article': <FileText className="w-4 h-4" />,
  'whitepaper': <BookOpen className="w-4 h-4" />,
  'template': <FileText className="w-4 h-4" />,
  'audio': <Music className="w-4 h-4" />,
  'image': <ImageIcon className="w-4 h-4" />,
  'other': <File className="w-4 h-4" />
};

export default function ContentPage() {
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const initialTabParam = searchParams?.get('tab');
  const initialTab = initialTabParam === 'resources' ? 'resources' : 'blog';
  const [activeTab, setActiveTab] = useState<'blog' | 'resources'>(initialTab as 'blog' | 'resources');
  
  // Blog Posts State
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [filteredBlogPosts, setFilteredBlogPosts] = useState<BlogPost[]>([]);
  const [blogSearchTerm, setBlogSearchTerm] = useState('');
  const [selectedBlogCategory, setSelectedBlogCategory] = useState<string>('all');
  // Resources State
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [resourceSearchTerm, setResourceSearchTerm] = useState('');
  const [selectedResourceCategory, setSelectedResourceCategory] = useState<string>('all');
  const [selectedResourceType, setSelectedResourceType] = useState<string>('all');

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

  // Refs for GSAP animations
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

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

  // GSAP Animations
  useEffect(() => {
    // Hero section animations
    if (heroRef.current) {
      gsap.fromTo(heroRef.current, 
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1,
          ease: "power2.out"
        }
      );
    }

    // Stats animations
    if (statsRef.current) {
      const stats = statsRef.current.querySelectorAll('.stat-item');
      gsap.fromTo(stats,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.2,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Cards animations
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.resource-card');
      gsap.fromTo(cards,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Moving gradient animation
    const gradientAnimation = gsap.to('.moving-gradient', {
      backgroundPosition: '200% 200%',
      duration: 20,
      ease: "none",
      repeat: -1,
      yoyo: true
    });

    return () => {
      gradientAnimation.kill();
    };
  }, [filteredResources]);

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
        onSuccess: () => { window.location.href = `/blog/${slug}`; }
      });
      setIsAuthModalOpen(true);
      return;
    }
    window.location.href = `/blog/${slug}`;
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
      if (!resource) {
        console.error('Resource not found');
        return;
      }

      // Try multiple download methods for better compatibility
      if (resource.fileUrl) {
        // Method 1: Try direct download with proper filename
        try {
          const link = document.createElement('a');
          link.href = resource.fileUrl;
          link.download = resource.title || 'download';
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          
          // Add to DOM, click, and remove
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Only increment download count when file is opened in new tab
          incrementDownloadCount(resourceId);
        } catch (downloadError) {
          console.log('Direct download failed, trying window.open:', downloadError);
          
          // Method 2: Fallback to window.open
          try {
            window.open(resource.fileUrl, '_blank');
            // Only increment download count when file is opened in new tab
            incrementDownloadCount(resourceId);
          } catch (windowOpenError) {
            console.log('Window.open failed, trying redirect:', windowOpenError);
            
            // Method 3: Final fallback - redirect to download endpoint
            window.location.href = `/api/content/resources/${resourceId}/download`;
            // Only increment download count when file is opened in new tab
            incrementDownloadCount(resourceId);
          }
        }
      } else {
        console.error('No file URL available');
        alert('File not available for download.');
      }
    } catch (error) {
      console.error('Error downloading resource:', error);
      alert('Download failed. Please try again.');
    }
  };

  const incrementDownloadCount = async (resourceId: string) => {
    try {
      // Call the download API to increment count
      const response = await fetch(`/api/content/resources/${resourceId}/download`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update local state with the exact count from the server
        setResources(prev => prev.map(r => 
          r.id === resourceId 
            ? { ...r, downloadCount: data.downloadCount }
            : r
        ));
      }
    } catch (error) {
      console.error('Error incrementing download count:', error);
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

  // Get featured resources (admin-selected + fill remaining slots with most downloaded)
  const adminFeaturedResources = resources.filter(resource => resource.isPublic && resource.featured);
  const remainingResourceSlots = 3 - adminFeaturedResources.length;
  const topResources = resources
    .filter(resource => resource.isPublic && !resource.featured)
    .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
    .slice(0, remainingResourceSlots)
    .map(resource => ({ ...resource, featured: true })); // Mark popular resources as featured when added to featured section
  const featuredResources = [...adminFeaturedResources, ...topResources].slice(0, 3);

  // Get featured blog posts (admin-selected + fill remaining slots with most viewed)
  const adminFeaturedBlogPosts = blogPosts.filter(post => post.status === 'published' && post.featured);
  const remainingBlogSlots = 3 - adminFeaturedBlogPosts.length;
  const topBlogPosts = blogPosts
    .filter(post => post.status === 'published' && !post.featured)
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, remainingBlogSlots)
    .map(post => ({ ...post, featured: true })); // Mark popular posts as featured when added to featured section
  const featuredBlogPosts = [...adminFeaturedBlogPosts, ...topBlogPosts].slice(0, 3);

  const getTypeIcon = (type: string) => {
    if (type === 'pdf') return <FileText className="w-10 h-10 text-gray-600" />;
    if (type === 'video') return <Video className="w-10 h-10 text-gray-600" />;
    if (type === 'article') return <FileText className="w-10 h-10 text-gray-600" />;
    if (type === 'whitepaper') return <BookOpen className="w-10 h-10 text-gray-600" />;
    if (type === 'template') return <FileText className="w-10 h-10 text-gray-600" />;
    if (type === 'audio') return <Music className="w-10 h-10 text-gray-600" />;
    if (type === 'image') return <ImageIcon className="w-10 h-10 text-gray-600" />;
    return <File className="w-10 h-10 text-gray-600" />;
  };

  return (
    <div className="min-h-screen relative">
      <Navigation />
      
      {/* Hero Section with Moving Gradient */}
      <div 
        ref={heroRef}
        className="moving-gradient bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_200%] text-white py-20 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
        <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
             <span className="text-white">Content </span>
             <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
               Library
             </span>
           </h1>
          
          <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Explore our collection of blog posts and resources designed to help you excel in leadership, team building, and professional development.
          </p>

          {/* Stats */}
          <div 
            ref={statsRef}
            className="grid grid-cols-3 gap-8 pt-8 border-t border-white/20 max-w-2xl mx-auto"
          >
            <div className="text-center stat-item">
              <div className="text-3xl font-bold text-white mb-1">{blogPosts.length}</div>
              <div className="text-sm text-white/80">Blog Posts</div>
            </div>
            <div className="text-center stat-item">
              <div className="text-3xl font-bold text-white mb-1">{resources.length}</div>
              <div className="text-sm text-white/80">Resources</div>
            </div>
            <div className="text-center stat-item">
              <div className="text-3xl font-bold text-white mb-1">
                {resources.reduce((sum, r) => sum + r.downloadCount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-white/80">Downloads</div>
            </div>
          </div>
        </div>
      </div>


              {/* Search and Filter Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'blog' | 'resources')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 lg:mb-8 h-10 lg:h-12">
              <TabsTrigger value="blog" className="text-xs sm:text-sm lg:text-base px-2 sm:px-3 lg:px-4">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 lg:h-4 lg:w-4 mr-1" />
                <span className="hidden sm:inline">Blog Posts</span>
                <span className="sm:hidden">Blog</span>
              </TabsTrigger>
              <TabsTrigger value="resources" className="text-xs sm:text-sm lg:text-base px-2 sm:px-3 lg:px-4">
                <Download className="h-3 w-3 sm:h-4 sm:w-4 lg:h-4 lg:w-4 mr-1" />
                <span className="hidden sm:inline">Resources</span>
                <span className="sm:hidden">Files</span>
              </TabsTrigger>
            </TabsList>

          {/* Blog Posts Tab */}
          <TabsContent value="blog" className="space-y-6">
            {/* Blog Search and Filters */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8">
              <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
                    <Input
                      placeholder="Search blog posts..."
                      value={blogSearchTerm}
                      onChange={(e) => setBlogSearchTerm(e.target.value)}
                      className="pl-10 lg:pl-12 h-10 lg:h-12 text-base lg:text-lg border-2 border-gray-200 focus:border-primary rounded-xl"
                    />
                  </div>
                </div>
                <Select value={selectedBlogCategory} onValueChange={setSelectedBlogCategory}>
                  <SelectTrigger className="w-full sm:w-48 h-10 lg:h-12 border-2 border-gray-200 focus:border-primary rounded-xl">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Featured Blog Posts */}
            {featuredBlogPosts.length > 0 && (
              <div className="mb-12 lg:mb-16">
                <div className="flex items-center gap-3 mb-6 lg:mb-8">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Featured Blog Posts</h2>
                    <p className="text-sm lg:text-base text-gray-600">Our most popular and insightful articles</p>
                  </div>
                </div>
                <div 
                  ref={cardsRef}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
                >
                  {featuredBlogPosts.map((post) => (
                    <Card key={post.id} className="blog-card group hover:shadow-2xl transition-all duration-300 border-2 border-primary/20 hover:border-primary/40 overflow-hidden">
                      <div className="relative h-48 bg-gradient-to-br from-primary/5 to-secondary/10">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"></div>
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0">
                            {post.featured ? 'Featured' : 'Popular'}
                          </Badge>
                        </div>

                        {post.featuredImage && (
                          <div className="absolute inset-0">
                            <img
                              src={post.featuredImage}
                              alt={post.title}
                              className="w-full h-full object-cover opacity-20"
                            />
                          </div>
                        )}
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <p className="text-gray-600 mb-4">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {post.viewCount?.toLocaleString() || 0} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {post.publishedAt?.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline" className="text-xs">
                            {categoryLabels[post.category] || post.category}
                          </Badge>
                          {post.tags?.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button 
                          onClick={() => handleViewPost(post.slug)}
                          className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white border-0 h-12 rounded-xl"
                        >
                          <ArrowRight className="w-5 h-5 mr-2" />
                          Read Article
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Blog Posts Grid */}
            {isLoadingBlogs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-80" />
                ))}
              </div>
            ) : filteredBlogPosts.filter(post => !featuredBlogPosts.some(fbp => fbp.id === post.id)).length === 0 ? (
              <div className="text-center py-8 lg:py-12">
                <FileText className="h-8 w-8 lg:h-12 lg:w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
                <p className="text-sm lg:text-base text-gray-600">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {filteredBlogPosts.filter(post => !featuredBlogPosts.some(fbp => fbp.id === post.id)).map((post) => (
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
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8">
              <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
                    <Input
                      placeholder="Search resources..."
                      value={resourceSearchTerm}
                      onChange={(e) => setResourceSearchTerm(e.target.value)}
                      className="pl-10 lg:pl-12 h-10 lg:h-12 text-base lg:text-lg border-2 border-gray-200 focus:border-primary rounded-xl"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <Select value={selectedResourceCategory} onValueChange={setSelectedResourceCategory}>
                  <SelectTrigger className="w-full sm:w-48 h-10 lg:h-12 border-2 border-gray-200 focus:border-primary rounded-xl">
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
                  <SelectTrigger className="w-full sm:w-48 h-10 lg:h-12 border-2 border-gray-200 focus:border-primary rounded-xl">
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
              </div>
            </div>

            {/* Featured Resources */}
            {featuredResources.length > 0 && (
              <div className="mb-12 lg:mb-16">
                <div className="flex items-center gap-3 mb-6 lg:mb-8">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Featured Resources</h2>
                    <p className="text-sm lg:text-base text-gray-600">Our most popular and valuable content</p>
                  </div>
                </div>
                <div 
                  ref={cardsRef}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
                >
                  {featuredResources.map((resource) => (
                    <Card key={resource.id} className="resource-card group hover:shadow-2xl transition-all duration-300 border-2 border-primary/20 hover:border-primary/40 overflow-hidden">
                      {resource.thumbnailUrl ? (
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={resource.thumbnailUrl} 
                            alt={resource.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"></div>
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0">
                              {resource.featured ? 'Featured' : 'Popular'}
                            </Badge>
                          </div>
                          <div className="absolute top-4 right-4">
                            <div className="w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center">
                              {typeIcons[resource.type]}
                            </div>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors drop-shadow-lg">
                              {resource.title}
                            </h3>
                          </div>
                        </div>
                      ) : (
                        <div className="relative h-48 bg-gradient-to-br from-primary/5 to-secondary/10">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"></div>
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0">
                              {resource.featured ? 'Featured' : 'Popular'}
                            </Badge>
                          </div>
                          <div className="absolute top-4 right-4">
                            <div className="w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center">
                              {typeIcons[resource.type]}
                            </div>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                              {resource.title}
                            </h3>
                          </div>
                        </div>
                      )}
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
              <div className="flex items-center justify-between mb-6 lg:mb-8">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    All Resources
                  </h2>
                  <p className="text-sm lg:text-base text-gray-600 mt-2">
                    {filteredResources.filter(r => !r.featured && !featuredResources.some(fr => fr.id === r.id)).length} resources available
                  </p>
                </div>
              </div>

              {isLoadingResources ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Skeleton key={i} className="h-80" />
                  ))}
                </div>
              ) : filteredResources.filter(r => !r.featured && !featuredResources.some(fr => fr.id === r.id)).length === 0 ? (
                <div className="text-center py-8 lg:py-12">
                  <Download className="h-8 w-8 lg:h-12 lg:w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">No resources found</h3>
                  <p className="text-sm lg:text-base text-gray-600">Try adjusting your search or filter criteria.</p>
                </div>
              ) : (
                <div 
                  ref={cardsRef}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
                >
                  {filteredResources.filter(r => !r.featured && !featuredResources.some(fr => fr.id === r.id)).map((resource) => (
                    <Card key={resource.id} className="group hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30 overflow-hidden">
                      {resource.thumbnailUrl ? (
                        <div className="relative h-40 overflow-hidden">
                          <img 
                            src={resource.thumbnailUrl} 
                            alt={resource.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-4 left-4">
                            <Badge variant="secondary" className="bg-white/90 text-gray-800">
                              {resource.type}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="relative h-40 bg-gradient-to-br from-gray-50 to-blue-50">
                          <div className="absolute top-4 left-4">
                            <Badge variant="secondary" className="bg-white/90 text-gray-800">
                              {resource.type}
                            </Badge>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            {getTypeIcon(resource.type)}
                          </div>
                        </div>
                      )}
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