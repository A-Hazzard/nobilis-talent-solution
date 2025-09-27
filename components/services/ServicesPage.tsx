import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Users, Target, TrendingUp, Award, Lightbulb, BookOpen, UserCheck } from 'lucide-react';
import { serviceImages } from '@/lib/constants/images';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const ServicesPage = () => {
  // Refs for GSAP animations
  const heroRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const whyChooseRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // All 8 services with correct content
  const services = [
    {
      id: 'individual-group-coaching',
      title: 'Executive, Individual & Group Coaching',
      subtitle: 'Grow with purpose.',
      description: 'Personalized coaching that sparks holistic growth, strengthens confidence, and helps individuals and teams achieve meaningful progress.',
      icon: Users,
      image: serviceImages['individual-group-coaching']
    },
    {
      id: 'performance-management-design',
      title: 'Performance Management Design',
      subtitle: 'Solutions to drive engagement and results.',
      description: 'We reimagine the approach to managing performance. With an intentional focus on the people, we redesign performance systems to be more human, more agile, and more impactful.',
      icon: Target,
      image: serviceImages['performance-management-design']
    },
    {
      id: 'leadership-development-design',
      title: 'Leadership Development Design',
      subtitle: 'Leaders who inspire action.',
      description: 'From emerging leaders to seasoned execs, we craft experiences to grow leaders who inspire, influence, and deliver results in a changing world.',
      icon: TrendingUp,
      image: serviceImages['leadership-development-design']
    },
    {
      id: 'talent-strategy-development',
      title: 'Talent Strategy Development',
      subtitle: 'People plans that work.',
      description: 'We partner with you to design plans to attract, engage, retain, and grow the right people so your organization thrives long-term.',
      icon: Award,
      image: serviceImages['talent-strategy-development']
    },
    {
      id: 'succession-workforce-planning',
      title: 'Succession & Workforce Planning Design',
      subtitle: 'Ready for tomorrow, today.',
      description: 'Future-proof your organization with smart, scalable plans that ensure the right people are ready for the right roles—when it matters most. We also partner with you to create plans that will minimize risk and create the biggest impact on your value agenda.',
      icon: Lightbulb,
      image: serviceImages['succession-workforce-planning']
    },
    {
      id: 'training-facilitation',
      title: 'Training & Facilitation',
      subtitle: 'Learning that sticks.',
      description: 'Interactive, engaging and practical learning experiences that build skills and shift mindsets — in the room or online. We partner with you to provide customized e-learning solutions and/or live instructor-led training to build critical human competencies such as emotional intelligence, expert communication, service excellence etc.',
      icon: BookOpen,
      image: serviceImages['training-facilitation']
    },
    {
      id: 'competency-model-development',
      title: 'Competency Model Development',
      subtitle: 'Defining what great looks like.',
      description: 'We partner with you to define and highlight the skills, behaviors, and mindsets that drive success in your organization – building clear actionable frameworks that guide hiring, development and performance.',
      icon: UserCheck,
      image: serviceImages['competency-model-development']
    },
    {
      id: 'targeted-talent-acquisition',
      title: 'Targeted Talent Acquisition',
      subtitle: 'The right people, right away.',
      description: 'Find and attract top talent that aligns with your culture and delivers on your strategy. Strategic, data-informed and deeply human.',
      icon: Users,
      image: serviceImages['targeted-talent-acquisition']
    }
  ];

  const whyChoosePoints = [
    {
      title: 'Evidence-Based Approach',
      description: 'Our solutions are grounded in proven methodologies and real-world experiences.',
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

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero section animation
      if (heroRef.current) {
        gsap.fromTo(heroRef.current.children, 
          {
            opacity: 0,
            y: 50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power2.out"
          }
        );
      }

      // Timeline services animation
      if (timelineRef.current) {
        const serviceItems = timelineRef.current.querySelectorAll('.service-item');
        serviceItems.forEach((item, index) => {
          gsap.fromTo(item,
            {
              opacity: 0,
              y: 50,
              scale: 0.95,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.4,
              delay: index * 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: item,
                start: "top 85%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
              }
            }
          );
        });

        // Timeline line animation
        const timelineLine = timelineRef.current.querySelector('.timeline-line');
        if (timelineLine) {
          gsap.fromTo(timelineLine,
            { scaleY: 0 },
            {
              scaleY: 1,
              duration: 1.5,
              ease: "power2.out",
              scrollTrigger: {
                trigger: timelineRef.current,
                start: "top 60%",
                end: "bottom 40%",
                scrub: 1
              }
            }
          );
        }

        // Timeline dots animation
        const timelineDots = timelineRef.current.querySelectorAll('.timeline-dot');
        timelineDots.forEach((dot, index) => {
          gsap.fromTo(dot,
            { scale: 0, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.3,
              delay: index * 0.1,
              ease: "back.out(1.2)",
              scrollTrigger: {
                trigger: dot,
                start: "top 85%",
                toggleActions: "play none none reverse"
              }
            }
          );
        });

        // Service images animation
        const serviceImages = timelineRef.current.querySelectorAll('.service-image');
        serviceImages.forEach((image, index) => {
          gsap.fromTo(image,
            {
              opacity: 0,
              scale: 0.9,
              rotationY: 10,
            },
            {
              opacity: 1,
              scale: 1,
              rotationY: 0,
              duration: 0.5,
              delay: index * 0.1 + 0.2,
              ease: "power2.out",
              scrollTrigger: {
                trigger: image,
                start: "top 85%",
                toggleActions: "play none none reverse"
              }
            }
          );
        });
      }

      // Why Choose section animation
      if (whyChooseRef.current) {
        const whyChooseItems = whyChooseRef.current.querySelectorAll('.why-choose-item');
        gsap.fromTo(whyChooseItems,
          {
            opacity: 0,
            y: 40,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: whyChooseRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }

      // CTA button animation
      if (ctaRef.current) {
        gsap.fromTo(ctaRef.current,
          {
            opacity: 0,
            y: 30,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ctaRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse"
            }
          }
        );

        // CTA button animation removed as requested
      }

    });

    return () => ctx.revert(); // Cleanup
  }, []);

  return (
    <div className="pt-20 bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 gradient-subtle">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div ref={heroRef} className="text-center mb-16">
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
          <div ref={timelineRef} className="relative">
            {/* Centered Timeline Line */}
            <div className="timeline-line absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-primary/30 hidden lg:block transform -translate-x-1/2 origin-top"></div>
            
            {/* Services Timeline */}
            <div className="space-y-20">
              {services.map((service, index) => {
                const IconComponent = service.icon;
                const isEven = index % 2 === 0;
                const isCompetencyModelDevelopment = service.id === 'competency-model-development';
                
                return (
                  <div key={service.title} id={service.id} className="service-item relative">
                    {/* Timeline Dot */}
                    <div className="timeline-dot absolute left-1/2 top-8 w-4 h-4 bg-primary rounded-full border-4 border-white shadow-lg hidden lg:block z-10 transform -translate-x-1/2"></div>
                    
                    {/* Service Number */}
                    <div className="absolute left-1/2 top-0 w-8 h-8 bg-primary text-white rounded-full items-center justify-center text-sm font-bold hidden lg:flex transform -translate-x-1/2 z-20">
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
                        {isCompetencyModelDevelopment ? (
                          // Card styling with white background for Competency Model Development
                          <div className="service-image relative bg-white p-6 rounded-2xl shadow-lg">
                            <Image
                              src={service.image}
                              alt={service.title}
                              width={600}
                              height={600}
                              className="w-full h-auto"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                if (target.parentElement) {
                                  target.parentElement.style.backgroundColor = '#f3f4f6';
                                }
                              }}
                            />
                          </div>
                        ) : (
                          // Card styling for other services
                          <div className="service-image relative h-80 lg:h-96 rounded-2xl overflow-hidden shadow-lg group cursor-pointer">
                            <Image
                              src={service.image}
                              alt={service.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                if (target.parentElement) {
                                  target.parentElement.style.backgroundColor = '#f3f4f6';
                                }
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent transition-opacity duration-300 group-hover:opacity-80" />
                            <div className="absolute bottom-4 right-4">
                              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                                <IconComponent className="h-6 w-6 text-primary transition-colors duration-300 group-hover:text-white" />
                              </div>
                            </div>
                          </div>
                        )}
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
          <div ref={whyChooseRef} className="text-center mb-16">
            <h2 className="text-section text-accent mb-6">
              Why Choose Nobilis Talent Solutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We believe that people are the true engine of every successful organization — and with the right guidance, tools, and support, their potential is limitless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChoosePoints.map((point) => {
              const IconComponent = point.icon;
              return (
                <div key={point.title} className="why-choose-item text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{point.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {point.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div ref={ctaRef} className="text-center mt-16">
            <Link href="/contact" className="btn-primary font-bold">
              Start Your Transformation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
