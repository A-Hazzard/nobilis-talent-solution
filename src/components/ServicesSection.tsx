import { Users, Target, Lightbulb, TrendingUp, Clock, Star } from 'lucide-react';

const ServicesSection = () => {
  const services = [
    {
      icon: Users,
      title: "Executive Leadership Coaching",
      description: "One-on-one coaching for senior executives to enhance their leadership effectiveness and drive organizational success.",
      features: [
        "Personalized leadership assessment",
        "Strategic thinking development", 
        "Communication and influence skills",
        "Performance optimization"
      ],
      duration: "3-6 months",
      price: "Custom pricing"
    },
    {
      icon: Target,
      title: "Team Development Programs",
      description: "Comprehensive programs designed to transform team dynamics and boost collective performance.",
      features: [
        "Team assessment and analysis",
        "Collaboration enhancement",
        "Conflict resolution strategies",
        "Goal alignment workshops"
      ],
      duration: "2-4 months", 
      price: "From $5,000"
    },
    {
      icon: Lightbulb,
      title: "Leadership Workshops",
      description: "Interactive workshops covering essential leadership skills for managers at all levels.",
      features: [
        "Customized curriculum",
        "Interactive learning modules",
        "Practical application exercises",
        "Follow-up coaching sessions"
      ],
      duration: "1-2 days",
      price: "From $2,500"
    },
    {
      icon: TrendingUp,
      title: "Organizational Culture Change",
      description: "Strategic initiatives to transform organizational culture and drive sustainable change.",
      features: [
        "Culture assessment",
        "Change management strategy",
        "Leadership alignment",
        "Implementation support"
      ],
      duration: "6-12 months",
      price: "Custom pricing"
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
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-section text-accent mb-6">
            Leadership Solutions That Drive Results
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Comprehensive coaching and development programs tailored to your organization's 
            unique challenges and goals.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {services.map((service, index) => (
            <div
              key={index}
              className="card-feature group animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-accent">{service.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {service.duration}
                    </div>
                    <div className="font-semibold text-primary">{service.price}</div>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                {service.description}
              </p>

              <div className="space-y-3 mb-8">
                {service.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <button className="btn-outline w-full group-hover:bg-primary group-hover:text-white transition-all duration-300">
                Learn More
              </button>
            </div>
          ))}
        </div>

        {/* Testimonial Highlight */}
        <div className="card-elevated bg-gradient-subtle text-center max-w-4xl mx-auto animate-fade-up">
          <div className="flex justify-center mb-6">
            {[...Array(testimonialHighlight.rating)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-secondary fill-current" />
            ))}
          </div>
          <blockquote className="text-2xl font-medium text-accent mb-8 leading-relaxed">
            "{testimonialHighlight.quote}"
          </blockquote>
          <div className="text-center">
            <div className="font-semibold text-accent">{testimonialHighlight.author}</div>
            <div className="text-muted-foreground">{testimonialHighlight.title}</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 animate-fade-up">
          <h3 className="text-3xl font-bold text-accent mb-6">
            Ready to Transform Your Leadership?
          </h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Schedule a free consultation to discuss your specific needs and explore 
            how we can work together to achieve your goals.
          </p>
          <a
            href="#contact"
            className="btn-primary mr-4"
          >
            Book Free Consultation
          </a>
          <a
            href="mailto:kareempayne11@gmail.com"
            className="btn-outline"
          >
            Email Directly
          </a>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;