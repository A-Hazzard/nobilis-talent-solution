import type { Testimonial } from '@/shared/types/entities';

/**
 * Utility class for testimonial display and formatting operations
 * Contains pure functions for testimonial data processing
 */
export class TestimonialUtils {
  /**
   * Format client name for display
   * @param clientName - Full client name
   * @returns Formatted name for display
   */
  static formatClientName(clientName: string): string {
    return clientName.trim();
  }

  /**
   * Generate initials from client name for avatar fallback
   * @param clientName - Full client name
   * @returns Initials string (e.g., "JD" for "John Doe")
   */
  static getInitials(clientName: string): string {
    return clientName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  /**
   * Truncate testimonial content for preview
   * @param content - Full testimonial content
   * @param maxLength - Maximum length for preview
   * @returns Truncated content with ellipsis if needed
   */
  static truncateContent(content: string, maxLength: number = 200): string {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength).trim() + '...';
  }

  /**
   * Get testimonial statistics from array
   * @param testimonials - Array of testimonials
   * @returns Statistics object with total count and average rating
   */
  static getTestimonialStats(testimonials: Testimonial[]): {
    total: number;
    averageRating: number;
    totalRating: number;
  } {
    if (testimonials.length === 0) {
      return { total: 0, averageRating: 0, totalRating: 0 };
    }

    const totalRating = testimonials.reduce((sum, testimonial) => sum + testimonial.rating, 0);
    const averageRating = totalRating / testimonials.length;

    return {
      total: testimonials.length,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalRating,
    };
  }

  /**
   * Sort testimonials by creation date (newest first)
   * @param testimonials - Array of testimonials
   * @returns Sorted array of testimonials
   */
  static sortByDate(testimonials: Testimonial[]): Testimonial[] {
    return [...testimonials].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Filter testimonials by rating
   * @param testimonials - Array of testimonials
   * @param minRating - Minimum rating to include
   * @returns Filtered array of testimonials
   */
  static filterByRating(testimonials: Testimonial[], minRating: number): Testimonial[] {
    return testimonials.filter(testimonial => testimonial.rating >= minRating);
  }

} 