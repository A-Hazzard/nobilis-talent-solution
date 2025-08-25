import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Users, Target, TrendingUp, Award, Lightbulb, BookOpen, UserCheck } from 'lucide-react';

const ServicesPage = () => {
  // All 8 services with correct content
  const services = [
    {
      id: 'individual-group-coaching',
      title: 'Individual & Group Coaching',
      subtitle: 'Grow with purpose.',
      description: 'Personalized coaching that sparks holistic growth, strengthens confidence, and helps individuals and teams achieve be better.',
      icon: Users,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop&crop=center'
    },
    {
      id: 'performance-management-design',
      title: 'Performance Management Design',
      subtitle: 'Solutions to drive engagement and results.',
      description: 'We reimagine the approach to managing performance. With an intentional focus on the people, we redesign performance systems to be more human, more agile, and more impactful.',
      icon: Target,
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=800&fit=crop&crop=center'
    },
    {
      id: 'leadership-development-design',
      title: 'Leadership Development Design',
      subtitle: 'Leaders who inspire action.',
      description: 'From emerging leaders to seasoned execs, we craft experiences to grow leaders who inspire, influence, and deliver results in a changing world.',
      icon: TrendingUp,
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=800&fit=crop&crop=center'
    },
    {
      id: 'talent-strategy-development',
      title: 'Talent Strategy Development',
      subtitle: 'People plans that work.',
      description: 'We partner with you to design plans to attract, engage, retain, and grow the right people so your organization thrives long-term.',
      icon: Award,
      image: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=1200&h=800&fit=crop&crop=center'
    },
    {
      id: 'succession-workforce-planning',
      title: 'Succession & Workforce Planning Design',
      subtitle: 'Ready for tomorrow, today.',
      description: 'Future-proof your organization with smart, scalable plans that ensure the right people are ready for the right roles—when it matters most. We also partner with you to create plans that will minimize risk and create the biggest impact on your value agenda.',
      icon: Lightbulb,
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=800&fit=crop&crop=center'
    },
    {
      id: 'training-facilitation',
      title: 'Training & Facilitation',
      subtitle: 'Learning that sticks.',
      description: 'Interactive, engaging and practical learning experiences that build skills and shift mindsets — in the room or online.',
      icon: BookOpen,
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=800&fit=crop&crop=center'
    },
    {
      id: 'competency-model-development',
      title: 'Competency Model Development',
      subtitle: 'Defining what great looks like.',
      description: 'We partner with you to define and highlight the skills, behaviors, and mindsets that drive success in your organization – building clear actionable frameworks that guide hiring, development and performance.',
      icon: UserCheck,
      image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=1200&h=800&fit=crop&crop=center'
    },
    {
      id: 'targeted-talent-acquisition',
      title: 'Targeted Talent Acquisition',
      subtitle: 'The right people, right away.',
      description: 'Find and attract top talent that aligns with your culture and delivers on your strategy. Strategic, data-informed and deeply human.',
      icon: Users,
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=800&fit=crop&crop=center'
    }
  ];

  const whyChoosePoints = [
    {
      title: 'Evidence-Based Approach',
      description: 'Our solutions are grounded in proven methodologies and real-world experience.',
      icon: Award
    },
    {
      title: 'Personalized Solutions',
      description: 'Every engagement is tailored to your unique needs and organizational context.',
      icon: Lightbulb
    },
    {
      title: 'Proven Results',
      description: 'Track record of delivering measurable outcomes and lasting impact.',
      icon: TrendingUp
    },
    {
      title: 'Holistic Development',
      description: 'We focus on the whole person and organization, not just isolated skills.',
      icon: CheckCircle
    }
  ];

  return (
    <div className="pt-20 bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 gradient-subtle">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16" data-animate>
            <h1 className="text-hero text-accent mb-6">
              Our Services
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Comprehensive coaching, consulting, and training solutions designed to elevate individual and organizational performance.
            </p>
          </div>
        </div>
      </section>

      {/* Services Timeline */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative">
            {/* Centered Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-primary/30 hidden lg:block transform -translate-x-1/2"></div>
            
            {/* Services Timeline */}
            <div className="space-y-20">
              {services.map((service, index) => {
                const IconComponent = service.icon;
                const isEven = index % 2 === 0;
                
                return (
                  <div key={service.title} id={service.id} className="relative" data-animate>
                    {/* Timeline Dot */}
                    <div className="absolute left-1/2 top-8 w-4 h-4 bg-primary rounded-full border-4 border-white shadow-lg hidden lg:block z-10 transform -translate-x-1/2"></div>
                    
                    {/* Service Number */}
                    <div className="absolute left-1/2 top-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold hidden lg:flex transform -translate-x-1/2 z-20">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    
                    {/* Service Content */}
                    <div className={`lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center ${isEven ? 'lg:pr-12' : 'lg:pl-12'}`}>
                      {/* Content Section */}
                      <div className={`${isEven ? 'lg:order-1' : 'lg:order-2'} mb-8 lg:mb-0`}>
                        <div className="space-y-4">
                          <h3 className="text-3xl font-bold text-accent">
                            {service.title}
                          </h3>
                          <p className="text-xl font-semibold text-primary">
                            {service.subtitle}
                          </p>
                          <p className="text-muted-foreground leading-relaxed text-lg">
                            {service.description}
                          </p>
                          
                        </div>
                      </div>
                      
                      {/* Image Section */}
                      <div className={`${isEven ? 'lg:order-2' : 'lg:order-1'} relative`}>
                        <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden shadow-lg">
                          <Image
                            src={service.image}
                            alt={service.title}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              if (target.parentElement) {
                                target.parentElement.style.backgroundColor = '#f3f4f6';
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                          <div className="absolute bottom-4 right-4">
                            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                              <IconComponent className="h-6 w-6 text-primary" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Nobilis Talent Solutions Section */}
      <section className="py-16 lg:py-24 gradient-subtle">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16" data-animate>
            <h2 className="text-section text-accent mb-6">
              Why Choose Nobilis Talent Solutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We believe that people are the true engine of every successful organization—and that with the right guidance, tools, and support, their potential is limitless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChoosePoints.map((point) => {
              const IconComponent = point.icon;
              return (
                <div key={point.title} className="text-center" data-animate>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{point.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {point.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-16" data-animate>
            <Link href="/contact" className="btn-primary">
              Start Your Transformation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
