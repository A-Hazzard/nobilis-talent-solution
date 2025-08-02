'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Target, 
  TrendingUp,
  Search
} from 'lucide-react';

interface SEOAnalyzerProps {
  title: string;
  description: string;
  content: string;
  keywords: string[];
}

interface SEOAnalysis {
  score: number;
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    suggestion?: string;
  }>;
  suggestions: string[];
}

export function SEOAnalyzer({ title, description, content, keywords }: SEOAnalyzerProps) {
  const [analysis, setAnalysis] = useState<SEOAnalysis>({
    score: 0,
    issues: [],
    suggestions: []
  });

  useEffect(() => {
    const analyzeSEO = () => {
      const issues: SEOAnalysis['issues'] = [];
      const suggestions: string[] = [];
      let score = 100;

      // Title analysis
      if (!title) {
        issues.push({
          type: 'error',
          message: 'Missing title',
          suggestion: 'Add a compelling title for your blog post'
        });
        score -= 20;
      } else if (title.length < 30) {
        issues.push({
          type: 'warning',
          message: 'Title too short',
          suggestion: 'Aim for 30-60 characters for better SEO'
        });
        score -= 5;
      } else if (title.length > 60) {
        issues.push({
          type: 'warning',
          message: 'Title too long',
          suggestion: 'Keep title under 60 characters to avoid truncation'
        });
        score -= 5;
      }

      // Description analysis
      if (!description) {
        issues.push({
          type: 'error',
          message: 'Missing meta description',
          suggestion: 'Add a compelling meta description'
        });
        score -= 15;
      } else if (description.length < 120) {
        issues.push({
          type: 'warning',
          message: 'Description too short',
          suggestion: 'Aim for 120-160 characters for better click-through rates'
        });
        score -= 3;
      } else if (description.length > 160) {
        issues.push({
          type: 'warning',
          message: 'Description too long',
          suggestion: 'Keep description under 160 characters'
        });
        score -= 3;
      }

      // Content analysis
      if (!content) {
        issues.push({
          type: 'error',
          message: 'No content',
          suggestion: 'Add meaningful content to your blog post'
        });
        score -= 30;
      } else {
        const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        
        if (wordCount < 300) {
          issues.push({
            type: 'warning',
            message: 'Content too short',
            suggestion: 'Aim for at least 300 words for better SEO'
          });
          score -= 10;
        } else if (wordCount > 2000) {
          suggestions.push('Great! Your content is comprehensive and detailed');
        }

        // Check for headings
        const headingCount = (content.match(/<h[1-6][^>]*>/g) || []).length;
        if (headingCount === 0) {
          issues.push({
            type: 'warning',
            message: 'No headings found',
            suggestion: 'Add headings to structure your content'
          });
          score -= 5;
        }

        // Check for images
        const imageCount = (content.match(/<img[^>]*>/g) || []).length;
        if (imageCount === 0) {
          suggestions.push('Consider adding images to make your content more engaging');
        }
      }

      // Keywords analysis
      if (keywords.length === 0) {
        issues.push({
          type: 'warning',
          message: 'No keywords specified',
          suggestion: 'Add relevant keywords for better SEO'
        });
        score -= 5;
      }

      setAnalysis({
        score: Math.max(0, score),
        issues,
        suggestions
      });
    };

    analyzeSEO();
  }, [title, description, content, keywords]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          SEO Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="font-medium">SEO Score</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
              {analysis.score}
            </span>
            {getScoreBadge(analysis.score)}
          </div>
        </div>
        
        <Progress value={analysis.score} className="h-2" />

        {/* Issues */}
        {analysis.issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Issues to Fix</h4>
            {analysis.issues.map((issue, index) => (
              <Alert key={index} variant={issue.type === 'error' ? 'destructive' : 'default'}>
                {issue.type === 'error' ? (
                  <XCircle className="h-4 w-4" />
                ) : issue.type === 'warning' ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <div className="font-medium">{issue.message}</div>
                  {issue.suggestion && (
                    <div className="text-sm opacity-80 mt-1">{issue.suggestion}</div>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Suggestions */}
        {analysis.suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Suggestions
            </h4>
            {analysis.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        )}

        {/* Content Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {content.replace(/<[^>]*>/g, '').split(/\s+/).length}
            </div>
            <div className="text-xs text-gray-600">Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {(content.match(/<h[1-6][^>]*>/g) || []).length}
            </div>
            <div className="text-xs text-gray-600">Headings</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 