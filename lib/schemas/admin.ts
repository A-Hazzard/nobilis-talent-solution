import { z } from 'zod';

// Blog Post Schema
export const blogPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .trim(),
  excerpt: z
    .string()
    .min(1, 'Excerpt is required')
    .min(10, 'Excerpt must be at least 10 characters')
    .max(500, 'Excerpt must be less than 500 characters')
    .trim(),
  content: z
    .string()
    .min(1, 'Content is required')
    .min(100, 'Content must be at least 100 characters')
    .max(50000, 'Content must be less than 50,000 characters')
    .trim(),
  category: z.enum(['leadership', 'team-building', 'strategy', 'communication', 'management', 'productivity', 'innovation', 'culture', 'other'], {
    required_error: 'Please select a category',
  }),
  tags: z
    .array(z.string())
    .min(1, 'Please add at least one tag')
    .max(10, 'You can add up to 10 tags'),
  featuredImage: z
    .string()
    .url('Please enter a valid image URL')
    .optional(),
  status: z.enum(['draft', 'published', 'archived'], {
    required_error: 'Please select a status',
  }),
  featured: z.boolean().default(false),
  readTime: z
    .number()
    .min(1, 'Read time must be at least 1 minute')
    .max(120, 'Read time must be less than 120 minutes')
    .optional(),
  metaTitle: z
    .string()
    .min(1, 'Meta title is required')
    .max(60, 'Meta title must be less than 60 characters')
    .trim(),
  metaDescription: z
    .string()
    .min(1, 'Meta description is required')
    .min(50, 'Meta description must be at least 50 characters')
    .max(160, 'Meta description must be less than 160 characters')
    .trim(),
});

export type BlogPostFormData = z.infer<typeof blogPostSchema>;

// Resource Schema
export const resourceSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters')
    .trim(),
  category: z.enum(['leadership', 'team-building', 'strategy', 'communication', 'management', 'productivity', 'innovation', 'culture', 'other'], {
    required_error: 'Please select a category',
  }),
  type: z.enum(['pdf', 'video', 'article', 'whitepaper', 'template', 'audio', 'image', 'other'], {
    required_error: 'Please select a resource type',
  }),
  tags: z
    .array(z.string())
    .min(1, 'Please add at least one tag')
    .max(10, 'You can add up to 10 tags'),
  fileUrl: z
    .string()
    .url('Please enter a valid file URL')
    .min(1, 'File URL is required'),
  thumbnailUrl: z
    .string()
    .url('Please enter a valid thumbnail URL')
    .optional(),
  isPublic: z.boolean().default(true),
  featured: z.boolean().default(false),
  downloadCount: z.number().min(0).default(0),
  fileSize: z
    .number()
    .min(0, 'File size must be positive')
    .optional(),
  duration: z
    .string()
    .min(1, 'Duration is required for video/audio resources')
    .optional(),
});

export type ResourceFormData = z.infer<typeof resourceSchema>;

// Testimonial Schema
export const testimonialSchema = z.object({
  clientName: z
    .string()
    .min(1, 'Client name is required')
    .min(2, 'Client name must be at least 2 characters')
    .max(100, 'Client name must be less than 100 characters')
    .trim(),
  clientTitle: z
    .string()
    .min(1, 'Client title is required')
    .min(2, 'Client title must be at least 2 characters')
    .max(100, 'Client title must be less than 100 characters')
    .trim(),
  organization: z
    .string()
    .min(1, 'Organization is required')
    .min(2, 'Organization must be at least 2 characters')
    .max(100, 'Organization must be less than 100 characters')
    .trim(),
  content: z
    .string()
    .min(1, 'Testimonial content is required')
    .min(10, 'Testimonial must be at least 10 characters')
    .max(1000, 'Testimonial must be less than 1000 characters')
    .trim(),
  rating: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  featured: z.boolean().default(false),
  status: z.enum(['pending', 'approved', 'rejected'], {
    required_error: 'Please select a status',
  }),
  clientImage: z
    .string()
    .url('Please enter a valid image URL')
    .optional(),
});

export type TestimonialFormData = z.infer<typeof testimonialSchema>;

// Lead Schema
export const leadSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .trim(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase(),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .trim(),
  organization: z
    .string()
    .min(1, 'Organization is required')
    .min(2, 'Organization must be at least 2 characters')
    .max(100, 'Organization must be less than 100 characters')
    .trim(),
  source: z.enum(['website', 'referral', 'social-media', 'email', 'phone', 'other'], {
    required_error: 'Please select a lead source',
  }),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'], {
    required_error: 'Please select a status',
  }),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    required_error: 'Please select a priority level',
  }),
  notes: z
    .string()
    .max(2000, 'Notes must be less than 2000 characters')
    .trim()
    .optional(),
  assignedTo: z
    .string()
    .min(1, 'Please assign the lead to someone')
    .optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;
