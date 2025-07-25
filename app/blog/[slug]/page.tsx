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
  Download
} from 'lucide-react';
import { BlogPost } from '@/shared/types/entities';
import { BlogService } from '@/lib/services/BlogService';
import Link from 'next/link';

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [slug, setSlug] = useState<string>('');

  const blogService = new BlogService();

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (slug) {
      loadBlogPost();
    }
  }, [slug]);

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
      }
    } catch (error) {
      console.error('Error loading blog post:', error);
      // Fallback to sample data
      setPost(getSamplePost(slug));
    } finally {
      setIsLoading(false);
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
        publishedAt: new Date('2025-05-20')
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
      publishedAt: new Date()
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
          <Link href="/blog">
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
          <Link href="/blog">
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
            <h3 className="text-lg font-semibold text-gray-900">Sources & References (0)</h3>
          </div>
          <p className="text-gray-600 text-sm">No sources or references available for this article.</p>
        </div>

        {/* Related Resources */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Leadership Guide PDF</h4>
                    <p className="text-sm text-gray-600">Download our comprehensive leadership guide</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Team Building Workbook</h4>
                    <p className="text-sm text-gray-600">Interactive exercises for team development</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        
      </div>
    </div>
  );
} 