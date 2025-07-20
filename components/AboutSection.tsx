import { CheckCircle, Award, Target, Users } from 'lucide-react';
import Image from 'next/image';

const AboutSection = () => {
  const achievements = [
    "Certified Leadership Development Coach",
    "MBA in Organizational Psychology", 
    "500+ Successful Coaching Engagements",
    "Featured Speaker at Leadership Conferences"
  ];

  const values = [
    {
      icon: Target,
      title: "Results-Driven",
      description: "Every coaching engagement is designed with measurable outcomes and clear success metrics."
    },
    {
      icon: Users,
      title: "People-Centered",
      description: "Leadership is about people. I help you build authentic connections that drive performance."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Committed to the highest standards of coaching practice and continuous professional development."
    }
  ];

  return (
    <section id="about" className="py-20 lg:py-32 gradient-subtle">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Image and stats */}
          <div className="relative" data-animate>
            <div className="relative z-10">
              <div className="relative w-full max-w-md mx-auto">
                <Image
                  src="/assets/kareem-profile.jpg"
                alt="Kareem Payne - Leadership Coach"
                  width={400}
                  height={500}
                  className="rounded-3xl shadow-strong hover-float"
              />
              </div>
            </div>
            
            {/* Floating achievement cards */}
            <div className="absolute -top-6 -right-6 animate-float">
              <div className="card-elevated bg-primary text-white p-6 max-w-48">
                <div className="text-3xl font-bold mb-1">5+</div>
                <div className="text-sm opacity-90">Years of Impact</div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 animate-float" style={{ animationDelay: '2s' }}>
              <div className="card-elevated bg-secondary text-white p-6 max-w-48">
                <div className="text-3xl font-bold mb-1">98%</div>
                <div className="text-sm opacity-90">Client Success Rate</div>
              </div>
            </div>
          </div>

          {/* Right side - Content */}
          <div data-animate>
            <h2 className="text-section text-accent mb-6">
              Meet Kareem Payne
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              With over 5 years of experience in leadership development, I've helped hundreds of 
              executives and teams unlock their potential and achieve extraordinary results.
            </p>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              My approach combines proven methodologies with practical, real-world application. 
              I believe that great leadership isn't about having all the answers—it's about 
              asking the right questions and empowering others to find solutions.
            </p>

            {/* Achievements */}
            <div className="mb-10">
              <h3 className="text-subsection text-accent mb-6">Credentials & Achievements</h3>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Values */}
            <div>
              <h3 className="text-subsection text-accent mb-6">Core Values</h3>
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
      </div>
    </section>
  );
};

export default AboutSection;