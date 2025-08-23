import { Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const ServicesSection = () => {
  const services = [
    {
      title: 'Individual & Group Coaching — Grow with purpose.',
      summary: 'Personalized coaching that sparks holistic growth, strengthens confidence, and helps individuals and teams be better.',
    },
    {
      title: 'Performance Management Design — Solutions to drive engagement and results.',
      summary: 'We reimagine the approach to managing performance with more human, agile, and impactful systems.',
    },
    {
      title: 'Leadership Development Design — Leaders who inspire action.',
      summary: 'From emerging leaders to seasoned execs, we craft experiences that grow leaders who inspire, influence, and deliver results.',
    },
    {
      title: 'Talent Strategy Development — People plans that work.',
      summary: 'Design plans to attract, engage, retain, and grow the right people so your organization thrives long-term.',
    },
    {
      title: 'Succession & Workforce Planning Design — Ready for tomorrow, today.',
      summary: 'Scalable plans that ensure the right people are ready for the right roles, minimizing risk and maximizing impact.',
    },
    {
      title: 'Training & Facilitation — Learning that sticks.',
      summary: 'Interactive, engaging, and practical learning experiences that build skills and shift mindsets — in the room or online.',
    },
    {
      title: 'Competency Model Development — Defining what great looks like.',
      summary: 'Define the skills, behaviors, and mindsets that drive success to guide hiring, development, and performance.',
    },
    {
      title: 'Targeted Talent Acquisition — The right people, right away.',
      summary: 'Find and attract top talent that aligns with your culture and delivers on your strategy — strategic, data-informed, and human.',
    },
  ];

  // More reliable Unsplash images with verified IDs
  const serviceImages: string[] = [
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=800&fit=crop&crop=center',
  ];

  const testimonialHighlight = {
    quote: "Kareem's leadership coaching transformed our entire management approach. Our team productivity increased by 40% within the first quarter.",
    author: "Sarah Johnson",
    title: "CEO, TechCorp Solutions",
    rating: 5
  };

  return (
    <section id="services" className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16" data-animate>
          <h2 className="text-section text-accent mb-6">
            Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            No pricing is displayed publicly. Explore offerings and connect to tailor solutions to your needs.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-20">
          {services.map((service, idx) => (
            <Card key={service.title} className="group h-full overflow-hidden hover-glow" data-animate>
              <div className="relative h-40 w-full overflow-hidden">
                <Image
                  src={serviceImages[idx % serviceImages.length]}
                  alt={service.title}
                  fill
                  className="object-cover transition-smooth group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.style.backgroundColor = '#f3f4f6';
                    }
                  }}
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{service.title}</CardTitle>
                <CardDescription>{service.summary}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="#contact" className="text-primary hover:underline">
                  Let's talk
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonial Highlight */}
        <div className="card-elevated bg-gradient-subtle text-center max-w-4xl mx-auto hover-glow" data-animate>
          <div className="flex justify-center mb-6">
            {[...Array(testimonialHighlight.rating)].map((_, i) => (
              <Star key={i} className="w-5 h-5 sm:w-6 sm:h-6 text-secondary fill-current" />
            ))}
          </div>
          <blockquote className="text-xl sm:text-2xl font-medium text-accent mb-8 leading-relaxed">
            "{testimonialHighlight.quote}"
          </blockquote>
          <div className="text-center">
            <div className="font-semibold text-accent">{testimonialHighlight.author}</div>
            <div className="text-muted-foreground">{testimonialHighlight.title}</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16" data-animate>
          <h3 className="text-2xl sm:text-3xl font-bold text-accent mb-6">
            Ready to Transform Your Leadership?
          </h3>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Schedule a free consultation to discuss your specific needs and explore 
            how we can work together to achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contact"
              className="btn-primary"
            >
              Book Free Consultation
            </a>
            <a
              href="mailto:nobilis.talent@gmail.com"
              className="btn-outline"
            >
              Email Directly
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
