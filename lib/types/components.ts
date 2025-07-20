/**
 * Component-specific types for the leadership coaching platform
 */

export type HeroSectionProps = {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
};

export type AboutSectionProps = {
  name?: string;
  title?: string;
  description?: string;
  imageSrc?: string;
};

export type ServicesSectionProps = {
  services?: Array<{
    id: string;
    title: string;
    description: string;
    icon?: string;
  }>;
};

export type TestimonialsSectionProps = {
  testimonials?: Array<{
    id: string;
    name: string;
    company: string;
    content: string;
    rating: number;
  }>;
};

export type ContactSectionProps = {
  email?: string;
  phone?: string;
  address?: string;
};

export type NavigationProps = {
  transparent?: boolean;
};

export type StickyCallButtonProps = {
  phone?: string;
  className?: string;
};

export type ScrollToTopProps = {
  threshold?: number;
  className?: string;
}; 