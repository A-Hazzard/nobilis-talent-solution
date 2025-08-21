import { Users, Target, TrendingUp, Star, Shield, Heart, BarChart3, GraduationCap, Search } from 'lucide-react';

const ServicesSection = () => {
  const services = [
    {
      icon: Heart,
      title: "Individual & Group Coaching — Grow with purpose.",
      description: "Personalized coaching that sparks holistic growth, strengthens confidence, and helps individuals and teams be better.",
      features: [
        "Personalized growth strategies",
        "Confidence building techniques", 
        "Team dynamics optimization",
        "Holistic development approach"
      ]
    },
    {
      icon: Target,
      title: "Performance Management Design — Solutions to drive engagement and results.",
      description: "We reimagine the approach to managing performance. With an intentional focus on the people, we redesign performance systems to be more human, more agile, and more impactful.",
      features: [
        "Human-centered performance systems",
        "Agile performance frameworks",
        "Engagement-driven metrics",
        "Impact measurement strategies"
      ]
    },
    {
      icon: Users,
      title: "Leadership Development Design — Leaders who inspire action.",
      description: "From emerging leaders to seasoned execs, we craft experiences to grow leaders who inspire, influence, and deliver results in a changing world.",
      features: [
        "Emerging leader development",
        "Executive leadership enhancement",
        "Inspiration and influence skills",
        "Results-driven leadership"
      ]
    },
    {
      icon: TrendingUp,
      title: "Talent Strategy Development — People plans that work.",
      description: "We partner with you to design plans to attract, engage, retain, and grow the right people so your organization thrives long-term.",
      features: [
        "Strategic talent attraction",
        "Employee engagement programs",
        "Retention optimization",
        "Long-term growth planning"
      ]
    },
    {
      icon: BarChart3,
      title: "Succession & Workforce Planning Design — Ready for tomorrow, today.",
      description: "Future-proof your organization with smart, scalable plans that ensure the right people are ready for the right roles—when it matters most. We also partner with you to create plans that will minimize risk and create the biggest impact on your value agenda.",
      features: [
        "Future-ready workforce planning",
        "Succession strategy development",
        "Risk minimization frameworks",
        "Value agenda optimization"
      ]
    },
    {
      icon: GraduationCap,
      title: "Training & Facilitation — Learning that sticks.",
      description: "Interactive, engaging and practical learning experiences that build skills and shift mindsets — in the room or online.",
      features: [
        "Interactive learning experiences",
        "Mindset transformation programs",
        "Practical skill building",
        "Virtual and in-person delivery"
      ]
    },
    {
      icon: Shield,
      title: "Competency Model Development — Defining what great looks like.",
      description: "We partner with you to define and highlight the skills, behaviors, and mindsets that drive success in your organization – building clear actionable frameworks that guide hiring, development and performance.",
      features: [
        "Success competency frameworks",
        "Behavioral assessment models",
        "Hiring guidance systems",
        "Development roadmaps"
      ]
    },
    {
      icon: Search,
      title: "Targeted Talent Acquisition — The right people, right away.",
      description: "Find and attract top talent that aligns with your culture and delivers on your strategy. Strategic, data-informed and deeply human.",
      features: [
        "Culture-aligned recruitment",
        "Strategic talent sourcing",
        "Data-informed selection",
        "Human-centered hiring"
      ]
    }
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {services.map((service, index) => (
            <div
              key={index}
              className="card-feature group hover-glow"
              data-animate
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-accent">{service.title}</h3>
                </div>
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                {service.description}
              </p>

              <div className="space-y-3 mb-8">
                {service.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-foreground text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <a href="#contact" className="btn-outline w-full group-hover:bg-primary group-hover:text-white transition-all duration-300 text-center">
                Let's talk
              </a>
            </div>
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