import { CheckCircle, Heart, Handshake, Shield, TrendingUp, BarChart3 } from 'lucide-react';
import Image from 'next/image';

const AboutSection = () => {
  const achievements = [
    "Over 4000 entrepreneurs and team members trained across the Caribbean & North America",
    "10+ keynotes delivered",
    "100+ leaders and entrepreneurs coached",
    "20+ businesses successfully launched"
  ];

  const credentials = [
    "MSc. Project Management & Evaluation",
    "BSc. Management with Psychology",
    "PMP (Project Management Professional)",
    "CPTD (Certified Professional in Talent Development)",
    "Certified Professional Coach (ICF Accredited Program)",
    "Certified Professional in Measuring the Impact of L&D"
  ];

  const values = [
    {
      icon: Heart,
      title: "People at the Heart",
      description: "Every strategy we design begins with the human experience – unlocking potential, inspiring growth, and honoring the unique value each person brings."
    },
    {
      icon: Handshake,
      title: "Trusted Partnerships",
      description: "We intentionally collaborate. We work alongside you as a strategic partner, building solutions together that fit your goals, culture, and vision."
    },
    {
      icon: Shield,
      title: "Integrity in Action",
      description: "We lead with transparency, authenticity and accountability. Our recommendations are grounded in what's right for you, your people and your business – not in quick fixes."
    },
    {
      icon: TrendingUp,
      title: "Growth as a Way of Life",
      description: "We champion continuous learning, adaptability and resilience, helping leaders and teams turn challenges into catalysts for transformation. We push ourselves and our clients to be better."
    },
    {
      icon: BarChart3,
      title: "Measurable Impact",
      description: "We focus on strategies that produce real, measurable outcomes."
    }
  ];

  return (
    <section id="about" className="py-20 lg:py-32 gradient-subtle">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Image and stats */}
          <div className="relative" data-animate>
            <div className="relative z-10">
              <div className="relative w-full max-w-sm sm:max-w-md mx-auto">
                <Image
                  src="/assets/kareem-profile.jpg"
                  alt="Kareem T. Payne - Human Capital Alchemist & Coach"
                  width={400}
                  height={500}
                  className="rounded-3xl shadow-strong hover-float"
                />
              </div>
            </div>
            
            {/* Floating achievement cards */}
            <div className="absolute -top-6 -right-6 animate-float hidden sm:block">
              <div className="card-elevated bg-primary text-white p-4 sm:p-6 max-w-40 sm:max-w-48">
                <div className="text-2xl sm:text-3xl font-bold mb-1">4000+</div>
                <div className="text-xs sm:text-sm opacity-90">People Trained</div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 animate-float hidden sm:block" style={{ animationDelay: '2s' }}>
              <div className="card-elevated bg-secondary text-white p-4 sm:p-6 max-w-40 sm:max-w-48">
                <div className="text-2xl sm:text-3xl font-bold mb-1">100+</div>
                <div className="text-sm sm:text-sm opacity-90">Leaders Coached</div>
              </div>
            </div>
          </div>

          {/* Right side - Content */}
          <div data-animate>
            <h2 className="text-section text-accent mb-6">
              About Kareem Payne
            </h2>
            
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Kareem T. Payne is a purposeful, passionate, and results-driven Human Capital Alchemist & Coach. With a career spanning diverse sectors—Retail, Hospitality, Financial Services, Energy, Manufacturing, Distribution, and Entrepreneurship—his work has impacted organizations and communities across the Caribbean and North America.
            </p>
            
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Currently, he specializes in helping organizations unlock their strategic potential by leveraging the growth and development of people. Through coaching, training, leadership development, and performance consulting, Kareem equips leaders and teams with the tools they need to thrive. As a qualified Emotional Intelligence (EI) practitioner, he champions EI as a catalyst for personal transformation, believing that self-awareness and emotional mastery are essential to lasting success.
            </p>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Whether in a boardroom, training room, or community hall, his message is consistent: growth is a choice, and learning never stops. A lifelong learner with a growth mindset, Kareem embraces the philosophy — "Stay Curious. Keep Learning."
            </p>

            {/* Achievements */}
            <div className="mb-10">
              <h3 className="text-subsection text-accent mb-6">Achievements</h3>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Credentials */}
            <div className="mb-10">
              <h3 className="text-subsection text-accent mb-6">Credentials & Certifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {credentials.map((credential, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                    <span className="text-foreground text-sm">{credential}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Values */}
            <div>
              <h3 className="text-subsection text-accent mb-6">Values</h3>
              <div className="space-y-6">
                {values.map((value, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                      <value.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-accent mb-1">{value.title}</h4>
                      <p className="text-muted-foreground text-sm">{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <a
                href="#contact"
                className="btn-primary"
              >
                Let's Work Together
              </a>
            </div>
          </div>
        </div>

        {/* Company Intro Section */}
        <div className="mt-20 grid lg:grid-cols-2 gap-16 items-center">
          <div data-animate>
            <h2 className="text-section text-accent mb-6">
              About Nobilis Talent Solutions LLC
            </h2>
            
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              At Nobilis Talent Solutions, we are dedicated to transforming the way leaders, teams and organizations unlock their full potential. Our approach is both strategic and human-centered — grounded in evidence-based practices but tailored to the unique story, challenges, and goals of each client, which allow us to create dynamic solutions that elevate talent, inspire leadership, and ignite organizational growth.
            </p>
            
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Through our passion and our approach, we turn challenges into opportunities and individuals into empowered changemakers. We don't just create plans; we create the conditions for sustainable change. That means listening deeply, asking the right questions, and challenging assumptions so we can unlock new possibilities together.
            </p>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              If you're ready to reimagine what you or your people can achieve and build a thriving, future-ready career, business or organization, let's connect and start the transformation journey.
            </p>
          </div>

          <div className="relative" data-animate>
            <div className="bg-gradient-to-br from-accent/10 via-primary/5 to-secondary/10 rounded-3xl p-8">
              <h3 className="text-xl font-semibold text-accent mb-4">Our Approach</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">Strategic and human-centered methodology</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">Evidence-based practices tailored to your unique needs</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">Sustainable change through deep listening and collaboration</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">Measurable outcomes and lasting impact</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;