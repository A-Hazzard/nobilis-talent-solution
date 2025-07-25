'use client';

import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      quote: "Kareem's coaching approach is transformational. He helped me develop the confidence and skills to lead our team through a major restructuring. Our employee engagement scores increased by 60%.",
      author: "Michael Thompson",
      title: "VP of Operations",
      company: "Global Manufacturing Inc.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 2,
      quote: "Working with Kareem was a game-changer for our leadership team. His practical strategies and insights helped us improve communication and drive better results across all departments.",
      author: "Lisa Rodriguez",
      title: "CEO",
      company: "TechStart Solutions", 
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 3,
      quote: "The leadership development program exceeded our expectations. Kareem's ability to connect with our team and provide actionable feedback was remarkable. Our productivity metrics speak for themselves.",
      author: "David Chen",
      title: "Director of Human Resources", 
      company: "Financial Services Corp",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 4,
      quote: "Kareem's coaching helped me become a more effective leader and communicator. The tools and frameworks he provided are something I use daily in my role.",
      author: "Jennifer Williams", 
      title: "Senior Manager",
      company: "Healthcare Innovations",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentTestimonial];

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
              "{current.quote}"
            </blockquote>

            <div className="flex items-center justify-center mb-6">
              <img
                src={current.image}
                alt={current.author}
                className="w-16 h-16 rounded-full mr-4 shadow-medium"
              />
              <div className="text-left">
                <div className="font-semibold text-accent text-lg">{current.author}</div>
                <div className="text-muted-foreground">{current.title}</div>
                <div className="text-primary font-medium text-sm">{current.company}</div>
              </div>
            </div>

            <div className="flex justify-center mb-8">
              {[...Array(current.rating)].map((_, i) => (
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
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <div className="text-muted-foreground">Leaders Coached</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">98%</div>
            <div className="text-muted-foreground">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">150+</div>
            <div className="text-muted-foreground">Companies Served</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">5</div>
            <div className="text-muted-foreground">Years Experience</div>
          </div>
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