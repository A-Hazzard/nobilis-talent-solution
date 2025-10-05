import { z } from 'zod';

// Onboarding Schema
export const onboardingSchema = z.object({
  // Profile step
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
  jobTitle: z
    .string()
    .min(1, 'Job title is required')
    .min(2, 'Job title must be at least 2 characters')
    .max(100, 'Job title must be less than 100 characters')
    .trim(),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .trim(),
  
  // Organization step
  organizationName: z
    .string()
    .min(1, 'Organization name is required')
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters')
    .trim(),
  organizationType: z.enum(['startup', 'small-business', 'enterprise', 'nonprofit', 'other'], {
    required_error: 'Please select an organization type',
  }),
  industryFocus: z
    .string()
    .min(1, 'Industry focus is required')
    .min(2, 'Industry focus must be at least 2 characters')
    .max(100, 'Industry focus must be less than 100 characters')
    .trim(),
  teamSize: z
    .string()
    .min(1, 'Please select a team size'),
  
  // Goals step
  primaryGoals: z
    .array(z.string())
    .min(1, 'Please select at least one primary goal')
    .max(8, 'You can select up to 8 primary goals'),
  challengesDescription: z
    .string()
    .min(1, 'Please describe your current challenges')
    .min(10, 'Challenge description must be at least 10 characters')
    .max(500, 'Challenge description must be less than 500 characters')
    .trim(),
  timeline: z
    .string()
    .min(1, 'Please select a timeline'),
  budget: z
    .string()
    .min(1, 'Please select a budget range'),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

// Onboarding step validation schemas
export const profileStepSchema = onboardingSchema.pick({
  firstName: true,
  lastName: true,
  jobTitle: true,
  phone: true,
});

export const organizationStepSchema = onboardingSchema.pick({
  organizationName: true,
  organizationType: true,
  industryFocus: true,
  teamSize: true,
});

export const goalsStepSchema = onboardingSchema.pick({
  primaryGoals: true,
  challengesDescription: true,
  timeline: true,
  budget: true,
});
