'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Eye,
  ArrowLeft,
  BookOpen,
  Download,
  ExternalLink
} from 'lucide-react';
import { BlogPost, Resource } from '@/shared/types/entities';
import { BlogService } from '@/lib/services/BlogService';
import { BlogAnalyticsService } from '@/lib/services/BlogAnalyticsService';
import { ResourcesService } from '@/lib/services/ResourcesService';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/AuthModal';

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { isAuthenticated, user } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [slug, setSlug] = useState<string>('');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const blogService = new BlogService();
  const blogAnalytics = BlogAnalyticsService.getInstance();
  const resourcesService = new ResourcesService();

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    if (!isAuthenticated) {
      // Show modal but still load post so views can be tracked anonymously
      setIsAuthModalOpen(true);
    }
    loadBlogPost();
  }, [slug, isAuthenticated]);

  const loadBlogPost = async () => {
    setIsLoading(true);
    try {
      // Try to load from API first
      const response = await blogService.getBySlug(slug);
      if (response.error) {
        console.error('Failed to load blog post:', response.error);
        // Fallback to sample data
        setPost(getSamplePost(slug));
      } else {
        setPost(response.post);
        // Increment aggregate view counter on the post
        if (response.post) {
          try {
            await blogService.incrementViewCount(response.post.id);
          } catch {
            // non-blocking
          }
        }
        // Load associated resources if the post has any
        if (response.post?.resources && response.post.resources.length > 0) {
          await loadResources(response.post.resources);
        }
        // Track view (after load)
        try {
          if (response.post) {
            await blogAnalytics.trackView(
              response.post.id,
              response.post.title,
              user?.id,
              user?.email
            );
          }
        } catch {
          // non-blocking
        }
      }
    } catch (error) {
      console.error('Error loading blog post:', error);
      // Fallback to sample data
      setPost(getSamplePost(slug));
    } finally {
      setIsLoading(false);
    }
  };

  const loadResources = async (resourceIds: string[]) => {
    try {
      const loadedResources: Resource[] = [];
      for (const id of resourceIds) {
        const response = await resourcesService.getById(id);
        if (response.resource) {
          loadedResources.push(response.resource);
        }
      }
      setResources(loadedResources);
    } catch (error) {
      console.error('Error loading resources:', error);
    }
  };

  const getFileIcon = (type: Resource['type']) => {
    switch (type) {
      case 'pdf':
        return <Download className="w-5 h-5 text-red-600" />;
      case 'docx':
        return <Download className="w-5 h-5 text-blue-600" />;
      case 'article':
        return <BookOpen className="w-5 h-5 text-green-600" />;
      case 'whitepaper':
        return <BookOpen className="w-5 h-5 text-purple-600" />;
      case 'template':
        return <Download className="w-5 h-5 text-orange-600" />;
      case 'toolkit':
        return <Download className="w-5 h-5 text-indigo-600" />;
      case 'image':
        return <Download className="w-5 h-5 text-pink-600" />;
      case 'video':
        return <Download className="w-5 h-5 text-red-600" />;
      case 'audio':
        return <Download className="w-5 h-5 text-yellow-600" />;
      default:
        return <Download className="w-5 h-5 text-gray-600" />;
    }
  };

  const getFileColor = (type: Resource['type']) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-100';
      case 'docx':
        return 'bg-blue-100';
      case 'article':
        return 'bg-green-100';
      case 'whitepaper':
        return 'bg-purple-100';
      case 'template':
        return 'bg-orange-100';
      case 'toolkit':
        return 'bg-indigo-100';
      case 'image':
        return 'bg-pink-100';
      case 'video':
        return 'bg-red-100';
      case 'audio':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-100';
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

  // Sample data fallback
  const getSamplePost = (slug: string): BlogPost => {
    if (slug === 'blog-1') {
      return {
        id: '1',
        title: 'Blog 1',
        slug: 'blog-1',
        excerpt: 'bla bla bla bla bnla',
        content: `
          <p>He walked down the steps from the train station in a bit of a hurry knowing the secrets in the briefcase must be secured as quickly as possible. The old shoes he wore had seen better days, but they were comfortable and familiar.</p>
          
          <p>As he made his way through the crowded platform, his mind wandered back to the girl he had left behind. She was growing up so fast, and he wondered if she would remember him when he returned.</p>
          
          <p>The briefcase felt heavier with each step, not just from the weight of the documents inside, but from the responsibility they represented. Lives depended on these papers reaching their destination safely.</p>
          
          <p>He checked his watch again, the familiar tick-tock reminding him of the passage of time. The meeting was scheduled for 3 PM sharp, and he couldn't afford to be late. Not this time.</p>
          
          <h2>The Journey Begins</h2>
          
          <p>The train ride had been uneventful, but his mind was racing with possibilities. What if someone had followed him? What if the documents had been compromised? These thoughts kept him alert throughout the journey.</p>
          
          <p>As the city skyline came into view, he felt a mixture of relief and apprehension. He was almost there, but the most dangerous part of his mission was yet to come.</p>
        `,
        category: 'lifestyle',
        tags: ['lifestyle', 'story', 'narrative'],
        featuredImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop',
        author: 'admin',
        authorName: 'Kyle Nagee',
        status: 'published',
        viewCount: 0,
        readTime: 0,
        createdAt: new Date('2025-05-20'),
        updatedAt: new Date('2025-05-20'),
        publishedAt: new Date('2025-05-20'),
        resources: ['resource-1', 'resource-2'], // Added sample resources
        references: [
          {
            title: 'Reference 1',
            url: 'https://example.com/reference1',
            description: 'Description for Reference 1'
          },
          {
            title: 'Reference 2',
            url: 'https://example.com/reference2',
            description: 'Description for Reference 2'
          }
        ]
      };
    }
    
    // Default fallback
    return {
      id: 'default',
      title: 'Sample Blog Post',
      slug: slug,
      excerpt: 'This is a sample blog post content.',
      content: '<p>This is a sample blog post content that would be displayed here.</p>',
      category: 'other',
      tags: ['sample'],
      featuredImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',
      author: 'admin',
      authorName: 'Unknown Author',
      status: 'published',
      viewCount: 0,
      readTime: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date(),
      resources: [], // Default to empty resources
      references: [] // Default to empty references
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-96 bg-gray-200 rounded mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
          <Link href="/content?tab=blog">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/content?tab=blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Blog Post Header */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          {/* Featured Image */}
          {post.featuredImage && (
            <div className="relative h-96 overflow-hidden rounded-t-lg">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
                         {/* Metadata Bar */}
             <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
               <div className="flex items-center gap-1">
                 <Clock className="w-4 h-4" />
                 <span>{post.readTime || 0} min read</span>
               </div>
               <div className="flex items-center gap-1">
                 <Calendar className="w-4 h-4" />
                 <span>{post.publishedAt?.toLocaleDateString() || 'Invalid Date'}</span>
               </div>
               <div className="flex items-center gap-1">
                 <Eye className="w-4 h-4" />
                 <span>{post.viewCount || 0} views</span>
               </div>
             </div>

                         {/* Title */}
             <h1 className="text-3xl font-bold text-gray-900 mb-6">{post.title}</h1>

            {/* Category and Tags */}
            <div className="flex items-center gap-2 mb-6">
              <Badge variant="outline" className="capitalize">
                {post.category}
              </Badge>
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Blog Content */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Sources & References */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Sources & References ({post.references?.length || 0})
            </h3>
          </div>
          {post.references && post.references.length > 0 ? (
            <div className="space-y-3">
              {post.references.map((reference, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <ExternalLink className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <a 
                      href={reference.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {reference.title}
                    </a>
                    {reference.description && (
                      <p className="text-sm text-gray-600 mt-1">{reference.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No sources or references available for this article.</p>
          )}
        </div>

        {/* Related Resources */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Related Resources ({resources.length})
          </h3>
          {resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((resource, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getFileColor(resource.type)}`}>
                        {getFileIcon(resource.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{resource.title}</h4>
                        <p className="text-sm text-gray-600">{resource.description}</p>
                      </div>
                    </div>
                    {resource.fileUrl && (
                      <div className="mt-3">
                        <button 
                          onClick={() => handleDownload(resource.id)}
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                        >
                          <Download className="w-4 h-4" />
                          Download Resource
                        </button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No related resources available for this article.</p>
          )}
        </div>

        
      </div>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Sign in to read blog posts"
        description="Please sign in or create an account to read this article."
        onSuccess={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
} 