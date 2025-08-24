import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, User } from 'lucide-react';
import { TestimonialUtils } from '@/lib/utils/testimonialUtils';
import type { Testimonial } from '@/shared/types/entities';

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  // Load testimonials on component mount
  useEffect(() => {
    const loadTestimonials = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { TestimonialsService } = await import('@/lib/services/TestimonialsService');
        const service = TestimonialsService.getInstance();
        const response = await service.getHomepageTestimonials(10);
        
        if (response.error) {
          setError(response.error);
        } else {
          // Sort testimonials by date (newest first)
          const sortedTestimonials = TestimonialUtils.sortByDate(response.testimonials);
          setTestimonials(sortedTestimonials);
        }
      } catch (error) {
        console.error('Error loading testimonials:', error);
        setError('Failed to load testimonials');
      } finally {
        setIsLoading(false);
      }
    };

    loadTestimonials();
  }, []);

  const nextTestimonial = () => {
    if (testimonials.length > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setSlideDirection('left');
      setTimeout(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        setIsTransitioning(false);
        setSlideDirection(null);
      }, 300);
    }
  };

  const prevTestimonial = () => {
    if (testimonials.length > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setSlideDirection('right');
      setTimeout(() => {
        setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
        setIsTransitioning(false);
        setSlideDirection(null);
      }, 300);
    }
  };



  // Get current testimonial or fallback
  const current = testimonials.length > 0 ? testimonials[currentTestimonial] : null;

  // Show loading state
  if (isLoading) {
    return (
      <section id="testimonials" className="py-20 lg:py-32 gradient-subtle">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-section text-accent mb-6">
              What Leaders Are Saying
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Loading testimonials...
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <div className="card-feature text-center p-8">
              <div className="animate-pulse">
                <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-8"></div>
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section id="testimonials" className="py-20 lg:py-32 gradient-subtle">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-section text-accent mb-6">
              What Leaders Are Saying
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Unable to load testimonials at this time.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Show empty state
  if (testimonials.length === 0) {
    return (
      <section id="testimonials" className="py-20 lg:py-32 gradient-subtle">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-section text-accent mb-6">
              What Leaders Are Saying
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              No testimonials available at this time.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="py-20 lg:py-32 gradient-subtle">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-section text-accent mb-6">
            What Leaders Are Saying
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Hear from executives and managers who have transformed their leadership 
            and achieved remarkable results with our coaching programs.
          </p>
        </div>

        {/* Main Testimonial Carousel */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="card-feature text-center relative overflow-hidden animate-fade-up">
            <Quote className="w-16 h-16 text-primary/20 mx-auto mb-8 transition-transform duration-300 hover:scale-110" />
            
            {/* Testimonial Content with Slide Animation */}
            <div className="relative overflow-hidden">
              <div 
                className={`transition-all duration-300 ease-in-out ${
                  slideDirection === 'left' 
                    ? 'transform translate-x-full opacity-0' 
                    : slideDirection === 'right' 
                    ? 'transform -translate-x-full opacity-0' 
                    : 'transform translate-x-0 opacity-100'
                }`}
              >
                <blockquote className="text-xl sm:text-2xl lg:text-3xl font-medium text-accent mb-8 leading-relaxed">
                  "{current?.content}"
                </blockquote>

                <div className="flex items-center justify-center mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mr-4 shadow-medium bg-primary/10 flex items-center justify-center transition-transform duration-300 hover:scale-105">
                    <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-accent text-base sm:text-lg">
                      {TestimonialUtils.formatClientName(current?.clientName || '')}
                    </div>
                    <div className="text-primary font-medium text-sm">{current?.company}</div>
                  </div>
                </div>

                <div className="flex justify-center mb-8">
                  {[...Array(current?.rating || 0)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 sm:w-6 sm:h-6 text-secondary fill-current transition-transform duration-300 hover:scale-110" />
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={prevTestimonial}
                disabled={isTransitioning}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={nextTestimonial}
                disabled={isTransitioning}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>


          </div>
        </div>
       
      </div>
    </section>
  );
};

export default TestimonialsSection;