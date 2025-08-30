import { TestimonialUtils } from '@/lib/utils/testimonialUtils';
import type { Testimonial } from '@/shared/types/entities';

describe('TestimonialUtils', () => {
  const mockTestimonials: Testimonial[] = [
    {
      id: '1',
      clientName: 'John Doe',
      company: 'Acme Corp',
      content: 'Excellent leadership coaching that transformed our team dynamics.',
      rating: 5,
      serviceType: 'leadership',
      isPublic: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      clientName: 'Jane Smith',
      company: 'Tech Solutions',
      content: 'Outstanding workshop on team building. Highly recommend!',
      rating: 4,
      serviceType: 'training',
      isPublic: true,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
    },
    {
      id: '3',
      clientName: 'Bob Johnson',
      company: 'Innovation Inc',
      content: 'Professional development session was very insightful and practical.',
      rating: 3,
      serviceType: 'consultation',
      isPublic: false,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
    },
  ];

  describe('formatClientName', () => {
    it('should trim whitespace from client name', () => {
      expect(TestimonialUtils.formatClientName('  John Doe  ')).toBe('John Doe');
      expect(TestimonialUtils.formatClientName('Jane Smith')).toBe('Jane Smith');
    });

    it('should handle empty strings', () => {
      expect(TestimonialUtils.formatClientName('')).toBe('');
      expect(TestimonialUtils.formatClientName('   ')).toBe('');
    });

    it('should preserve internal spacing', () => {
      expect(TestimonialUtils.formatClientName('  Mary Jane Watson  ')).toBe('Mary Jane Watson');
    });
  });

  describe('getInitials', () => {
    it('should generate correct initials for two names', () => {
      expect(TestimonialUtils.getInitials('John Doe')).toBe('JD');
      expect(TestimonialUtils.getInitials('Jane Smith')).toBe('JS');
    });

    it('should handle single names', () => {
      expect(TestimonialUtils.getInitials('Madonna')).toBe('M');
      expect(TestimonialUtils.getInitials('Cher')).toBe('C');
    });

    it('should handle multiple names (take first two)', () => {
      expect(TestimonialUtils.getInitials('Mary Jane Watson')).toBe('MJ');
      expect(TestimonialUtils.getInitials('Jean-Luc Pierre Emmanuel')).toBe('JP');
    });

    it('should convert to uppercase', () => {
      expect(TestimonialUtils.getInitials('john doe')).toBe('JD');
      expect(TestimonialUtils.getInitials('jane smith')).toBe('JS');
    });

    it('should handle empty strings and edge cases', () => {
      expect(TestimonialUtils.getInitials('')).toBe('');
      expect(TestimonialUtils.getInitials(' ')).toBe('');
      expect(TestimonialUtils.getInitials('A')).toBe('A');
    });

    it('should handle names with special characters', () => {
      expect(TestimonialUtils.getInitials("O'Connor Smith")).toBe('OS');
      expect(TestimonialUtils.getInitials('Jean-Pierre Dupont')).toBe('JD');
    });
  });

  describe('truncateContent', () => {
    const longContent = 'This is a very long testimonial content that exceeds the maximum length limit and should be truncated with ellipsis at the end to provide a preview of the full content.';

    it('should truncate content longer than max length', () => {
      const result = TestimonialUtils.truncateContent(longContent, 50);
      expect(result.length).toBeLessThanOrEqual(54); // 50 + '...' = 53, but trim might affect
      expect(result.endsWith('...')).toBe(true);
      expect(result).toContain('This is a very long testimonial');
    });

    it('should not truncate content shorter than max length', () => {
      const shortContent = 'Short testimonial.';
      const result = TestimonialUtils.truncateContent(shortContent, 50);
      expect(result).toBe(shortContent);
      expect(result.endsWith('...')).toBe(false);
    });

    it('should use default max length of 200', () => {
      const veryLongContent = 'This is a very long testimonial content that exceeds 200 characters. '.repeat(5);
      const result = TestimonialUtils.truncateContent(veryLongContent);
      expect(result.length).toBeLessThanOrEqual(203); // 200 + '...'
      expect(result.endsWith('...')).toBe(true);
    });

    it('should handle content exactly at max length', () => {
      const exactContent = 'A'.repeat(100);
      const result = TestimonialUtils.truncateContent(exactContent, 100);
      expect(result).toBe(exactContent);
      expect(result.endsWith('...')).toBe(false);
    });

    it('should trim whitespace before adding ellipsis', () => {
      const contentWithSpaces = 'This content ends with spaces    ';
      const result = TestimonialUtils.truncateContent(contentWithSpaces, 20);
      expect(result).toBe('This content ends wi...');
    });
  });

  describe('getTestimonialStats', () => {
    it('should calculate correct statistics', () => {
      const stats = TestimonialUtils.getTestimonialStats(mockTestimonials);
      
      expect(stats.total).toBe(3);
      expect(stats.totalRating).toBe(12); // 5 + 4 + 3
      expect(stats.averageRating).toBe(4.0); // 12 / 3 = 4.0
    });

    it('should handle empty array', () => {
      const stats = TestimonialUtils.getTestimonialStats([]);
      
      expect(stats.total).toBe(0);
      expect(stats.totalRating).toBe(0);
      expect(stats.averageRating).toBe(0);
    });

    it('should round average rating to 1 decimal place', () => {
      const unevenTestimonials: Testimonial[] = [
        { ...mockTestimonials[0], rating: 5 },
        { ...mockTestimonials[1], rating: 4 },
        { ...mockTestimonials[2], rating: 4 },
      ];
      
      const stats = TestimonialUtils.getTestimonialStats(unevenTestimonials);
      expect(stats.averageRating).toBe(4.3); // (5 + 4 + 4) / 3 = 4.333... -> 4.3
    });

    it('should handle single testimonial', () => {
      const singleTestimonial = [mockTestimonials[0]];
      const stats = TestimonialUtils.getTestimonialStats(singleTestimonial);
      
      expect(stats.total).toBe(1);
      expect(stats.totalRating).toBe(5);
      expect(stats.averageRating).toBe(5.0);
    });
  });

  describe('sortByDate', () => {
    it('should sort testimonials by creation date (newest first)', () => {
      const sorted = TestimonialUtils.sortByDate(mockTestimonials);
      
      expect(sorted[0].createdAt).toEqual(new Date('2024-01-20')); // Jane Smith
      expect(sorted[1].createdAt).toEqual(new Date('2024-01-15')); // John Doe
      expect(sorted[2].createdAt).toEqual(new Date('2024-01-10')); // Bob Johnson
    });

    it('should not mutate original array', () => {
      const originalOrder = [...mockTestimonials];
      const sorted = TestimonialUtils.sortByDate(mockTestimonials);
      
      expect(mockTestimonials).toEqual(originalOrder);
      expect(sorted).not.toBe(mockTestimonials); // Different array reference
    });

    it('should handle empty array', () => {
      const sorted = TestimonialUtils.sortByDate([]);
      expect(sorted).toEqual([]);
    });

    it('should handle single testimonial', () => {
      const single = [mockTestimonials[0]];
      const sorted = TestimonialUtils.sortByDate(single);
      expect(sorted).toEqual(single);
    });

    it('should handle testimonials with same date', () => {
      const sameDate = new Date('2024-01-15');
      const sameDateTestimonials: Testimonial[] = [
        { ...mockTestimonials[0], createdAt: sameDate },
        { ...mockTestimonials[1], createdAt: sameDate },
      ];
      
      const sorted = TestimonialUtils.sortByDate(sameDateTestimonials);
      expect(sorted).toHaveLength(2);
      // Order should be maintained when dates are equal
    });
  });

  describe('filterByRating', () => {
    it('should filter testimonials by minimum rating', () => {
      const highRated = TestimonialUtils.filterByRating(mockTestimonials, 4);
      
      expect(highRated).toHaveLength(2);
      expect(highRated[0].rating).toBe(5); // John Doe
      expect(highRated[1].rating).toBe(4); // Jane Smith
    });

    it('should include testimonials with exact minimum rating', () => {
      const exactRating = TestimonialUtils.filterByRating(mockTestimonials, 4);
      
      const janeSmith = exactRating.find(t => t.clientName === 'Jane Smith');
      expect(janeSmith).toBeDefined();
      expect(janeSmith?.rating).toBe(4);
    });

    it('should return empty array when no testimonials meet criteria', () => {
      const perfectRating = TestimonialUtils.filterByRating(mockTestimonials, 6);
      expect(perfectRating).toEqual([]);
    });

    it('should return all testimonials when minimum rating is very low', () => {
      const allTestimonials = TestimonialUtils.filterByRating(mockTestimonials, 1);
      expect(allTestimonials).toHaveLength(3);
    });

    it('should handle empty input array', () => {
      const result = TestimonialUtils.filterByRating([], 4);
      expect(result).toEqual([]);
    });

    it('should not mutate original array', () => {
      const originalLength = mockTestimonials.length;
      TestimonialUtils.filterByRating(mockTestimonials, 4);
      expect(mockTestimonials).toHaveLength(originalLength);
    });
  });

  // Integration tests
  describe('integration scenarios', () => {
    it('should work together for testimonial display pipeline', () => {
      // Simulate a complete testimonial processing pipeline
      const highRatedTestimonials = TestimonialUtils.filterByRating(mockTestimonials, 4);
      const sortedTestimonials = TestimonialUtils.sortByDate(highRatedTestimonials);
      const stats = TestimonialUtils.getTestimonialStats(sortedTestimonials);
      
      expect(sortedTestimonials).toHaveLength(2);
      expect(sortedTestimonials[0].clientName).toBe('Jane Smith'); // Newest
      expect(stats.averageRating).toBe(4.5); // (5 + 4) / 2
      
      // Get initials and truncate content for display
      const displayData = sortedTestimonials.map(testimonial => ({
        initials: TestimonialUtils.getInitials(testimonial.clientName),
        shortContent: TestimonialUtils.truncateContent(testimonial.content, 50),
        formattedName: TestimonialUtils.formatClientName(testimonial.clientName),
      }));
      
      expect(displayData[0].initials).toBe('JS');
      expect(displayData[0].shortContent.length).toBeLessThanOrEqual(53);
      expect(displayData[1].initials).toBe('JD');
    });

    it('should handle edge cases in pipeline', () => {
      const emptyArray: Testimonial[] = [];
      
      const filtered = TestimonialUtils.filterByRating(emptyArray, 4);
      const sorted = TestimonialUtils.sortByDate(filtered);
      const stats = TestimonialUtils.getTestimonialStats(sorted);
      
      expect(filtered).toEqual([]);
      expect(sorted).toEqual([]);
      expect(stats.total).toBe(0);
      expect(stats.averageRating).toBe(0);
    });
  });
});
