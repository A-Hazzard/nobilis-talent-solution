import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, User } from 'lucide-react';
import { TestimonialUtils } from '@/lib/utils/testimonialUtils';
import type { Testimonial } from '@/shared/types/entities';

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (testimonials.length > 0) {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }
  };

  const prevTestimonial = () => {
    if (testimonials.length > 0) {
      setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }
  };

  // Get current testimonial or fallback
  const current = testimonials.length > 0 ? testimonials[currentTestimonial] : null;

  // Get display statistics
  const displayStats = TestimonialUtils.getDisplayStats(testimonials);

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
            <Quote className="w-16 h-16 text-primary/20 mx-auto mb-8" />
            
            <blockquote className="text-2xl lg:text-3xl font-medium text-accent mb-8 leading-relaxed">
              "{current?.content}"
            </blockquote>

            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full mr-4 shadow-medium bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="text-left">
                              <div className="font-semibold text-accent text-lg">
                {TestimonialUtils.formatClientName(current?.clientName || '')}
              </div>
              <div className="text-primary font-medium text-sm">{current?.company}</div>
              </div>
            </div>

            <div className="flex justify-center mb-8">
              {[...Array(current?.rating || 0)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-secondary fill-current" />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={prevTestimonial}
                className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary hover:text-white transition-smooth flex items-center justify-center"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextTestimonial}
                className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary hover:text-white transition-smooth flex items-center justify-center"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Dots indicator */}
            <div className="flex justify-center space-x-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-smooth ${
                    index === currentTestimonial ? 'bg-primary' : 'bg-primary/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-8 animate-fade-up">
          {displayStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 animate-fade-up">
          <div className="card-elevated bg-gradient-hero text-white max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-6">
              Join Hundreds of Successful Leaders
            </h3>
            <p className="text-xl opacity-90 mb-8 leading-relaxed">
              Ready to transform your leadership and drive exceptional results? 
              Let's start with a conversation about your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="bg-white text-accent px-8 py-4 rounded-full font-semibold hover:bg-white/90 transition-smooth"
              >
                Schedule Free Consultation
              </a>
              <a
                href="tel:678-920-6605"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-accent transition-smooth"
              >
                Call (678) 920-6605
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;