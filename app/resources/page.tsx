'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Calendar, FileText, Video, BookOpen, Star, Grid, List, Image, Music, File } from 'lucide-react';
import { Resource } from '@/shared/types/entities';
import Navigation from '@/components/Navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Enhanced static sample data with more diverse types
const sampleResources: Resource[] = [
  {
    id: '1',
    title: 'Leadership Excellence Guide',
    description: 'A comprehensive guide to developing leadership skills in the modern workplace. This detailed resource covers everything from communication strategies to team management techniques.',
    category: 'leadership',
    type: 'pdf',
    fileUrl: '#',
    featured: true,
    tags: ['leadership', 'management', 'skills'],
    downloadCount: 1247,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    isPublic: true,
    createdBy: 'admin'
  },
  {
    id: '2',
    title: 'Team Building Workshop Video',
    description: 'Learn effective team building strategies through this interactive workshop recording. Features real-world examples and practical exercises.',
    category: 'team-building',
    type: 'video',
    fileUrl: '#',
    featured: true,
    tags: ['team-building', 'workshop', 'video'],
    downloadCount: 892,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    isPublic: true,
    createdBy: 'admin'
  },
  {
    id: '3',
    title: 'Strategic Planning Framework',
    description: 'A step-by-step framework for developing and implementing strategic plans. Includes templates and case studies.',
    category: 'strategy',
    type: 'pdf',
    fileUrl: '#',
    featured: false,
    tags: ['strategy', 'planning', 'framework'],
    downloadCount: 567,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    isPublic: true,
    createdBy: 'admin'
  },
  {
    id: '4',
    title: 'Communication Mastery Article',
    description: 'Master the art of effective communication in professional settings. Learn techniques for presentations, meetings, and one-on-one conversations.',
    category: 'communication',
    type: 'article',
    fileUrl: '#',
    featured: false,
    tags: ['communication', 'presentation', 'meetings'],
    downloadCount: 445,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    isPublic: true,
    createdBy: 'admin'
  },
  {
    id: '5',
    title: 'Executive Coaching Whitepaper',
    description: 'An in-depth analysis of executive coaching methodologies and their impact on organizational performance.',
    category: 'leadership',
    type: 'whitepaper',
    fileUrl: '#',
    featured: true,
    tags: ['coaching', 'executive', 'performance'],
    downloadCount: 678,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    isPublic: true,
    createdBy: 'admin'
  },
  {
    id: '6',
    title: 'Project Management Template',
    description: 'Comprehensive project management templates and tools for successful project delivery.',
    category: 'strategy',
    type: 'template',
    fileUrl: '#',
    featured: false,
    tags: ['project-management', 'templates', 'tools'],
    downloadCount: 334,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
    isPublic: true,
    createdBy: 'admin'
  },
  {
    id: '7',
    title: 'Leadership Podcast Series',
    description: 'A collection of insightful podcasts featuring industry leaders sharing their experiences and wisdom.',
    category: 'leadership',
    type: 'audio',
    fileUrl: '#',
    featured: false,
    tags: ['podcast', 'leadership', 'insights'],
    downloadCount: 789,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    isPublic: true,
    createdBy: 'admin'
  },
  {
    id: '8',
    title: 'Team Performance Toolkit',
    description: 'A complete toolkit for improving team performance, including assessment tools and improvement strategies.',
    category: 'team-building',
    type: 'toolkit',
    fileUrl: '#',
    featured: false,
    tags: ['performance', 'assessment', 'improvement'],
    downloadCount: 456,
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    isPublic: true,
    createdBy: 'admin'
  },
  {
    id: '9',
    title: 'Leadership Infographic Collection',
    description: 'Visual representations of key leadership concepts and strategies for quick reference.',
    category: 'leadership',
    type: 'image',
    fileUrl: '#',
    featured: false,
    tags: ['infographic', 'visual', 'quick-reference'],
    downloadCount: 234,
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
    isPublic: true,
    createdBy: 'admin'
  },
  {
    id: '10',
    title: 'Change Management Guide',
    description: 'A comprehensive guide to managing organizational change effectively and minimizing resistance.',
    category: 'strategy',
    type: 'pdf',
    fileUrl: '#',
    featured: false,
    tags: ['change-management', 'organizational', 'resistance'],
    downloadCount: 345,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    isPublic: true,
    createdBy: 'admin'
  }
];

const categoryLabels: Record<string, string> = {
  'leadership': 'Leadership',
  'team-building': 'Team Building',
  'strategy': 'Strategy',
  'communication': 'Communication',
  'videos': 'Videos',
  'articles': 'Articles',
  'pdfs': 'PDFs',
  'whitepapers': 'Whitepapers',
  'other': 'Other'
};

const typeLabels: Record<string, string> = {
  'pdf': 'PDF',
  'video': 'Video',
  'article': 'Article',
  'whitepaper': 'Whitepaper',
  'template': 'Template',
  'toolkit': 'Toolkit',
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
  'toolkit': <FileText className="w-4 h-4" />,
  'audio': <Music className="w-4 h-4" />,
  'image': <Image className="w-4 h-4" />,
  'other': <File className="w-4 h-4" />
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>(sampleResources);
  const [filteredResources, setFilteredResources] = useState<Resource[]>(sampleResources);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const [itemsToShow, setItemsToShow] = useState(6);

  // Refs for GSAP animations
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Filter resources based on search and filters
  useEffect(() => {
    let filtered = resources;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    setFilteredResources(filtered);
    setItemsToShow(6); // Reset items to show when filtering
  }, [resources, searchTerm, selectedCategory, selectedType]);

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

  const handleDownload = async (resourceId: string) => {
    console.log(`Downloading resource: ${resourceId}`);
    
    // Update download count locally for demo
    setResources(prev => prev.map(resource => 
      resource.id === resourceId 
        ? { ...resource, downloadCount: resource.downloadCount + 1 }
        : resource
    ));
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
    const maxLength = 120;
    
    if (description.length <= maxLength || isExpanded) {
      return description;
    }
    
    return description.substring(0, maxLength) + '...';
  };

  const featuredResources = resources.filter(resource => resource.featured);
  const regularResources = filteredResources.filter(resource => !resource.featured).slice(0, itemsToShow);
  const hasMoreResources = filteredResources.filter(resource => !resource.featured).length > itemsToShow;

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
          <h1 className="text-5xl lg:text-7xl font-bold mb-6">
            Resources &
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Insights
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Access our comprehensive collection of leadership resources, tools, and insights 
            to help you and your organization excel.
          </p>

          {/* Stats */}
          <div 
            ref={statsRef}
            className="grid grid-cols-3 gap-8 pt-8 border-t border-white/20 max-w-2xl mx-auto"
          >
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
            <div className="text-center stat-item">
              <div className="text-3xl font-bold text-white mb-1">{featuredResources.length}</div>
              <div className="text-sm text-white/80">Featured</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-12">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-primary rounded-xl"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
            <Select value={selectedType} onValueChange={setSelectedType}>
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
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none h-12 px-4"
              >
                <Grid className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none h-12 px-4"
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Resources */}
        {featuredResources.length > 0 && (
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
            <div 
              ref={cardsRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {featuredResources.map((resource) => (
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
                        {typeIcons[resource.type]}
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
                      onClick={() => handleDownload(resource.id)}
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

          {viewMode === 'grid' ? (
            <div 
              ref={cardsRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {regularResources.map((resource) => (
                <Card key={resource.id} className="resource-card group hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30 overflow-hidden">
                  <div className="relative h-40 bg-gradient-to-br from-gray-50 to-blue-50">
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="text-xs">
                        {typeLabels[resource.type]}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center">
                        {typeIcons[resource.type]}
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
                        className="p-0 h-auto text-primary hover:text-primary/80 mb-4 text-xs"
                      >
                        {expandedDescriptions.has(resource.id) ? 'Read Less' : 'Read More'}
                      </Button>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {resource.downloadCount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {resource.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {resource.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      onClick={() => handleDownload(resource.id)}
                      variant="outline"
                      className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 h-10 rounded-lg"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div 
              ref={cardsRef}
              className="space-y-6"
            >
              {regularResources.map((resource) => (
                <Card key={resource.id} className="resource-card group hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-primary/30">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center">
                          {typeIcons[resource.type]}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                              {resource.title}
                            </h3>
                            <p className="text-gray-600 text-lg leading-relaxed">
                              {truncateDescription(resource.description, resource.id)}
                            </p>
                            {resource.description.length > 120 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleDescription(resource.id)}
                                className="p-0 h-auto text-primary hover:text-primary/80 mt-2"
                              >
                                {expandedDescriptions.has(resource.id) ? 'Read Less' : 'Read More'}
                              </Button>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-sm flex-shrink-0 ml-4">
                            {typeLabels[resource.type]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                          <span className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            {resource.downloadCount.toLocaleString()} downloads
                          </span>
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {resource.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            {resource.tags?.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-sm">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Button 
                            onClick={() => handleDownload(resource.id)}
                            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white border-0 px-8 h-12 rounded-xl"
                          >
                            <Download className="w-5 h-5 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMoreResources && (
            <div className="text-center mt-12">
              <Button
                onClick={() => setItemsToShow(prev => prev + 6)}
                variant="outline"
                size="lg"
                className="px-8 py-3 text-lg rounded-xl border-2 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
              >
                Load More Resources
              </Button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No resources found</h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>

      {/* Footer rendered globally in RootLayout */}
    </div>
  );
} 