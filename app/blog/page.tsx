'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Calendar,
  Clock,
  ArrowRight,
  User,
  Heart,
  MessageCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BlogPost } from '@/shared/types/entities';
import { BlogService } from '@/lib/services/BlogService';

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

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const blogService = new BlogService();

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    setIsLoading(true);
    try {
      const response = await blogService.getAll({ status: 'published' });
      if (response.error) {
        console.error('Failed to load blog posts:', response.error);
        // Fallback to sample data
        setBlogPosts(getSamplePosts());
      } else {
        setBlogPosts(response.posts);
      }
    } catch (error) {
      console.error('Error loading blog posts:', error);
      // Fallback to sample data
      setBlogPosts(getSamplePosts());
    } finally {
      setIsLoading(false);
    }
  };

  // Sample data fallback
  const getSamplePosts = (): BlogPost[] => [
    {
      id: '1',
      title: 'Blog 1',
      slug: 'blog-1',
      excerpt: 'bla bla bla bla bnla',
      content: 'He walked down the steps from the train station in a bit of a hurry knowing the secrets in the briefcase must be secured as quickly as possible. The old shoes he wore had seen better days, but they were comfortable and familiar. As he made his way through the crowded platform, his mind wandered back to the girl he had left behind. She was growing up so fast, and he wondered if she would remember him when he returned.',
      category: 'lifestyle',
      tags: ['lifestyle', 'story', 'narrative'],
      featuredImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
      author: 'admin',
      authorName: 'Kyle Nagee',
      status: 'published',
      viewCount: 0,
      readTime: 0,
      createdAt: new Date('2025-05-20'),
      updatedAt: new Date('2025-05-20'),
      publishedAt: new Date('2025-05-20')
    },
    {
      id: '2',
      title: 'The Future of Leadership in the Digital Age',
      slug: 'future-leadership-digital-age',
      excerpt: 'How technology is reshaping leadership practices and what leaders need to know to stay ahead.',
      content: 'Full article content would go here...',
      category: 'leadership',
      tags: ['leadership', 'digital', 'technology', 'future'],
      featuredImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
      author: 'admin',
      authorName: 'Kareem Payne',
      status: 'published',
      viewCount: 1247,
      readTime: 8,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      publishedAt: new Date('2024-01-15')
    },
    {
      id: '3',
      title: 'Building High-Performance Teams: A Comprehensive Guide',
      slug: 'building-high-performance-teams-guide',
      excerpt: 'Learn the key principles and strategies for creating and maintaining high-performance teams.',
      content: 'Full article content would go here...',
      category: 'team-building',
      tags: ['team-building', 'performance', 'collaboration', 'management'],
      featuredImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
      author: 'admin',
      authorName: 'Kareem Payne',
      status: 'published',
      viewCount: 892,
      readTime: 12,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
      publishedAt: new Date('2024-01-10')
    }
  ];

  // Filter posts based on search and category
  useEffect(() => {
    let filtered = blogPosts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    setFilteredPosts(filtered);
  }, [blogPosts, searchTerm, selectedCategory]);

  const handleViewPost = (slug: string) => {
    // Navigate to individual blog post page
    window.location.href = `/blog/${slug}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Leadership Insights & Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover valuable insights, strategies, and thought leadership content 
              to help you excel in your professional journey.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
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
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Latest Articles ({filteredPosts.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden bg-white">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {categoryLabels[post.category] || post.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime || 0} min read</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{post.publishedAt?.toLocaleDateString() || 'Invalid Date'}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{post.authorName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>0</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>0</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleViewPost(post.slug)}
                    variant="outline"
                    size="sm"
                    className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-500">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 