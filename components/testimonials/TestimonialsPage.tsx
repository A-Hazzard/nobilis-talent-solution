import { Star, Quote } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';

const TestimonialsPage = () => {
  const testimonials = [
    {
      name: 'David',
      role: 'Global Implementation Manager, Starbucks',
      content: 'Zach and I worked extensively together at Starbucks to create a comprehensive training program that is required for all people managers at the company. Zach is dependable, effective, and a strong motivator and communicator. I highly recommend Zach as a partner and would love to work with him again in the future.',
      rating: 5,
      company: 'Starbucks'
    },
    {
      name: 'Sarah Johnson',
      role: 'HR Director, TechStart Inc.',
      content: 'Working with Nobilis Talent Solutions transformed our approach to talent management. The personalized coaching program helped our emerging leaders gain confidence and develop the skills they needed to drive our company forward.',
      rating: 5,
      company: 'TechStart Inc.'
    },
    {
      name: 'Michael Chen',
      role: 'CEO, Growth Ventures',
      content: 'The strategic HR consulting services provided by Nobilis Talent Solutions were invaluable in helping us scale our organization. Their evidence-based approach and practical solutions made a real difference in our growth trajectory.',
      rating: 5,
      company: 'Growth Ventures'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Learning & Development Manager, Healthcare Plus',
      content: 'The training and facilitation sessions were engaging, practical, and immediately applicable. Our team gained valuable skills that have improved our performance and collaboration significantly.',
      rating: 5,
      company: 'Healthcare Plus'
    },
    {
      name: 'James Thompson',
      role: 'Operations Director, Manufacturing Co.',
      content: 'The talent acquisition strategy developed by Nobilis Talent Solutions helped us find the right people who align with our culture and drive our success. Their approach is both strategic and human-centered.',
      rating: 5,
      company: 'Manufacturing Co.'
    },
    {
      name: 'Lisa Park',
      role: 'VP of People, Innovation Labs',
      content: 'The performance management system designed by Nobilis Talent Solutions has revolutionized how we approach employee development and engagement. It\'s more human, agile, and impactful than anything we\'ve used before.',
      rating: 5,
      company: 'Innovation Labs'
    }
  ];

  const stats = [
    { number: '200+', label: 'People Trained' },
    { number: '100+', label: 'Leaders Coached' },
    { number: '20+', label: 'Businesses Launched' },
    { number: '10+', label: 'Keynotes Delivered' }
  ];

  return (
    <div className="pt-20 bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 gradient-subtle">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16" data-animate>
            <h1 className="text-hero text-accent mb-6">
              Client Testimonials
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Real experiences from clients who have transformed their lives and careers with Nobilis Talent Solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center" data-animate>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16 lg:py-24 gradient-subtle">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16" data-animate>
            <h2 className="text-section text-accent mb-6">
              What Our Clients Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover how we've helped organizations and individuals achieve their goals and unlock their potential.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="group hover-glow" data-animate>
                <CardHeader>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-primary/30 mb-4" />
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed mb-6">
                    "{testimonial.content}"
                  </CardDescription>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-primary font-medium mt-1">
                      {testimonial.company}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center" data-animate>
            <h2 className="text-section text-accent mb-6">
              Ready to Transform Your Future?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              Join the hundreds of individuals and organizations who have already experienced the transformative power of our coaching and consulting services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="btn-primary">
                Get Started Today
              </a>
              <a href="/services" className="btn-outline">
                Explore Our Services
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TestimonialsPage;
