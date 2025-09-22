/**
 * Centralized image management for the application
 * All static images are imported here for pre-rendering optimization
 */

// Import all static images for pre-rendering
import chart from '@/public/assets/chart.png';
import coaching from '@/public/assets/coaching.jpg';
import growthMetrics from '@/public/assets/growth-metrics.svg';
import heroLeadership from '@/public/assets/hero.jpg';
import kareemProfile from '@/public/assets/kareem.png';
import sarahProfile from '@/public/assets/sarah.png';
import leadershipDevelopmentDesign from '@/public/assets/leaderShipDevelopmentDesign.jpg';
import logoTransparent from '@/public/assets/logo-transparent.png';
import performanceManagementDesign from '@/public/assets/performanceManagementDesign.jpg';
import talentStrategyDevelopment from '@/public/assets/talentStategyDevelopment.jpg';
import targetTalentAcquisition from '@/public/assets/targetTalentAcquisition.jpg';
import successionWorkforcePlanning from '@/public/assets/successionWorkforcePlanning.jpg';

// Service images mapping - organized by service type
export const serviceImages = {
  // Individual & Group Coaching
  'individual-group-coaching': coaching,
  
  // Performance Management Design
  'performance-management-design': performanceManagementDesign,
  
  // Leadership Development Design
  'leadership-development-design': leadershipDevelopmentDesign,
  
  // Talent Strategy Development
  'talent-strategy-development': talentStrategyDevelopment,
  
  // Succession & Workforce Planning Design
  'succession-workforce-planning': successionWorkforcePlanning,
  
  // Training & Facilitation - using coaching as it's training-related
  'training-facilitation': 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=800&fit=crop&crop=center',
  
  // Competency Model Development - using leadership development as it's skills-related
  'competency-model-development': 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=1200&h=800&fit=crop&crop=center',
  
  // Targeted Talent Acquisition
  'targeted-talent-acquisition': targetTalentAcquisition,
} as const;

// Team member images
export const teamImages = {
  kareem: kareemProfile,
  sarah: sarahProfile,
} as const;

// General purpose images
export const generalImages = {
  chart,
  heroLeadership,
  growthMetrics,
  kareemProfile,
  sarahProfile,
  logoTransparent,
} as const;

// Export all images for easy access
export const images = {
  ...serviceImages,
  ...teamImages,
  ...generalImages,
} as const;

// Type for image keys
export type ServiceImageKey = keyof typeof serviceImages;
export type TeamImageKey = keyof typeof teamImages;
export type GeneralImageKey = keyof typeof generalImages;
export type ImageKey = keyof typeof images;

export default images;
