'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Download, FileText, User } from 'lucide-react';
import { BlogService } from '@/lib/services/BlogService';
import { ResourcesService } from '@/lib/services/ResourcesService';
import type { BlogPost, Resource } from '@/shared/types/entities';
import Link from 'next/link';

export default function ContentSection() {
  const [activeTab, setActiveTab] = useState<'blogs' | 'resources'>('blogs');
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const blogService = new BlogService();
  const resourcesService = new ResourcesService();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load published blogs
      const blogsResult = await blogService.getPublishedPosts(6);
      if (blogsResult.error) {
        console.error('Error loading blogs:', blogsResult.error);
      } else {
        setBlogs(blogsResult.posts);
      }

      // Load public resources
      const resourcesResult = await resourcesService.getPublicResources(6);
      if (resourcesResult.error) {
        console.error('Error loading resources:', resourcesResult.error);
      } else {
        setResources(resourcesResult.resources);
      }
    } catch (err) {
      console.error('Error loading content:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };



  const getFileIcon = (type: Resource['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'docx':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'article':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'whitepaper':
        return <FileText className="h-4 w-4 text-purple-500" />;
      case 'template':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'toolkit':
        return <FileText className="h-4 w-4 text-indigo-500" />;
      case 'image':
        return <FileText className="h-4 w-4 text-pink-500" />;
      case 'video':
        return <FileText className="h-4 w-4 text-red-600" />;
      case 'audio':
        return <FileText className="h-4 w-4 text-yellow-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Content Library</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our latest blog posts and valuable resources
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'blogs' | 'resources')}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="blogs">Blog Posts</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="blogs" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="h-full">
                    <CardHeader>
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-6 w-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="resources" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="h-full">
                    <CardHeader>
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-6 w-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Content Library</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our latest blog posts and valuable resources
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'blogs' | 'resources')}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="blogs">Blog Posts</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="blogs" className="mt-8">
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
                <Button onClick={loadContent} className="mt-4">Try Again</Button>
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No blog posts available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                  <Card key={blog.id} className="h-full hover:shadow-lg transition-shadow">
                    {blog.featuredImage && (
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={blog.featuredImage}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{blog.category}</Badge>
                        {blog.readTime && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {blog.readTime} min read
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-lg line-clamp-2">
                        <Link href={`/blog/${blog.slug}`} className="hover:text-blue-600 transition-colors">
                          {blog.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {blog.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {blog.authorName}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(blog.publishedAt || blog.createdAt)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {blogs.length > 0 && (
              <div className="text-center mt-8">
                <Button asChild>
                  <Link href="/content?tab=blog">View All Blog Posts</Link>
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="resources" className="mt-8">
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
                <Button onClick={loadContent} className="mt-4">Try Again</Button>
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No resources available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((resource) => (
                  <Card key={resource.id} className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{resource.category}</Badge>
                        <Badge variant="outline">{resource.type}</Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">
                        {resource.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {resource.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          {getFileIcon(resource.type)}
                          <span className="ml-1">{resource.fileSize}</span>
                        </div>
                        <div className="flex items-center">
                          <Download className="h-3 w-3 mr-1" />
                          {resource.downloadCount} downloads
                        </div>
                      </div>
                      
                                             <div className="flex gap-2">
                         {resource.fileUrl && (
                           <Button size="sm" asChild className="flex-1">
                             <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                               <Download className="h-3 w-3 mr-1" />
                               Download
                             </a>
                           </Button>
                         )}
                       </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {resources.length > 0 && (
              <div className="text-center mt-8">
                <Button asChild>
                  <Link href="/content?tab=resources">View All Resources</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
} 