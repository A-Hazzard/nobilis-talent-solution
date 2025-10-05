import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { serviceImages } from '@/lib/constants/images';

const ServicesSection = () => {
  const services = [
    {
      title: 'Executive Leadership Coaching',
      subtitle: 'Grow with purpose.',
      description:
        'Personalized coaching that sparks holistic growth, strengthens confidence, and helps individuals and teams be better.',
      image: serviceImages['individual-group-coaching'],
    },
    {
      title: 'Business, Individual & Group Coaching',
      subtitle: 'Solutions to drive engagement and results.',
      description:
        'We reimagine how performance is managed. With an intentional focus on people, we redesign performance systems to be more human, agile, and impactful.',
      image: serviceImages['performance-management-design'],
    },
    {
      title: 'Leadership Development',
      subtitle: 'Leaders who inspire action.',
      description:
        'From emerging leaders to seasoned execs, we craft experiences that grow leaders who inspire, influence, and deliver in a changing world.',
      image: serviceImages['leadership-development-design'],
    },
    {
      title: 'Human Resources & Talent Management Consulting',
      subtitle: 'People plans that work.',
      description:
        'We partner with you to design plans to attract, engage, retain, and grow the right people so your organization thrives long‑term.',
      image: serviceImages['talent-strategy-development'],
    },
    {
      title: 'E-learning Development & Live Training',
      subtitle: 'Learning that sticks.',
      description:
        'Interactive, engaging, and practical learning experiences that build skills and shift mindsets — in the room or online.',
      image: serviceImages['training-facilitation'],
    },
  ];

  // Show all 5 services on landing page
  const landingPageServices = services;

  return (
    <section id="services" className="pt-14 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-section text-accent mb-6">Services</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore our coaching, consulting, and training solutions designed to elevate individual and organizational performance.
          </p>
        </div>

        {/* Services Grid - Show all 5 services on landing page */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-12">
          {landingPageServices.map((service) => (
            <Card key={service.title} className="group h-full overflow-hidden hover-glow flex flex-col">
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
                      (target.parentElement as HTMLElement).style.backgroundColor = '#f3f4f6';
                    }
                  }}
                />
              </div>
              <CardHeader className="flex-1">
                <CardTitle className="text-lg font-semibold text-accent leading-tight">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="mt-auto">
                <Link href="/services">
                  <Button className="btn-primary w-full">Learn More</Button>
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

