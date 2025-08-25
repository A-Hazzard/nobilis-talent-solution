import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ServicesSection = () => {
  const services = [
    {
      title: 'Individual & Group Coaching',
      subtitle: 'Grow with purpose.',
      description: 'Personalized coaching that sparks holistic growth, strengthens confidence, and helps individuals and teams achieve be better.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop&crop=center',
    },
    {
      title: 'Performance Management Design',
      subtitle: 'Solutions to drive engagement and results.',
      description: 'We reimagine the approach to managing performance. With an intentional focus on the people, we redesign performance systems to be more human, more agile, and more impactful.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=800&fit=crop&crop=center',
    },
    {
      title: 'Leadership Development Design',
      subtitle: 'Leaders who inspire action.',
      description: 'From emerging leaders to seasoned execs, we craft experiences to grow leaders who inspire, influence, and deliver results in a changing world.',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=800&fit=crop&crop=center',
    },
    {
      title: 'Talent Strategy Development',
      subtitle: 'People plans that work.',
      description: 'We partner with you to design plans to attract, engage, retain, and grow the right people so your organization thrives long-term.',
      image: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=1200&h=800&fit=crop&crop=center',
    },
    {
      title: 'Succession & Workforce Planning Design',
      subtitle: 'Ready for tomorrow, today.',
      description: 'Future-proof your organization with smart, scalable plans that ensure the right people are ready for the right roles—when it matters most. We also partner with you to create plans that will minimize risk and create the biggest impact on your value agenda.',
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=800&fit=crop&crop=center',
    },
    {
      title: 'Training & Facilitation',
      subtitle: 'Learning that sticks.',
      description: 'Interactive, engaging and practical learning experiences that build skills and shift mindsets — in the room or online.',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=800&fit=crop&crop=center',
    },
    {
      title: 'Competency Model Development',
      subtitle: 'Defining what great looks like.',
      description: 'We partner with you to define and highlight the skills, behaviors, and mindsets that drive success in your organization – building clear actionable frameworks that guide hiring, development and performance.',
      image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=1200&h=800&fit=crop&crop=center',
    },
    {
      title: 'Targeted Talent Acquisition',
      subtitle: 'The right people, right away.',
      description: 'Find and attract top talent that aligns with your culture and delivers on your strategy. Strategic, data-informed and deeply human.',
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=800&fit=crop&crop=center',
    },
  ];

  // Show only first 3 services on landing page
  const landingPageServices = services.slice(0, 3);

  return (
    <section id="services" className="pt-20 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16" data-animate>
          <h2 className="text-section text-accent mb-6">
            Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore our comprehensive range of coaching, consulting, and training solutions designed to elevate individual and organizational performance.
          </p>
        </div>

        {/* Services Grid - Show only 3 on landing page */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-20">
          {landingPageServices.map((service, _idx) => (
            <Card key={service.title} className="group h-full overflow-hidden hover-glow" data-animate>
              <div className="relative h-40 w-full overflow-hidden">
                <Image
                  src={service.image}
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
                <CardTitle className="text-lg font-semibold text-accent">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/services">
                  <Button className="btn-primary w-full">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
