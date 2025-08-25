import { Heart, Target, Users, Award, Lightbulb, Shield, TrendingUp, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ValuesPage = () => {
  const values = [
    {
      title: 'Purpose-Driven',
      description: 'We believe in the power of purpose to drive meaningful change and lasting impact.',
      icon: Heart,
      color: 'text-red-500'
    },
    {
      title: 'Evidence-Based',
      description: 'Our approaches are grounded in proven methodologies and real-world experience.',
      icon: Award,
      color: 'text-blue-500'
    },
    {
      title: 'Human-Centered',
      description: 'People are at the heart of everything we do. We prioritize human potential and well-being.',
      icon: Users,
      color: 'text-green-500'
    },
    {
      title: 'Results-Oriented',
      description: 'We focus on delivering measurable outcomes that create lasting value for our clients.',
      icon: Target,
      color: 'text-purple-500'
    },
    {
      title: 'Innovation',
      description: 'We continuously evolve our methods to stay ahead of changing workplace dynamics.',
      icon: Lightbulb,
      color: 'text-yellow-500'
    },
    {
      title: 'Integrity',
      description: 'We operate with transparency, honesty, and ethical practices in all our engagements.',
      icon: Shield,
      color: 'text-indigo-500'
    }
  ];

  const principles = [
    {
      title: 'Growth Mindset',
      description: 'We believe that learning never stops and that every challenge is an opportunity for growth.',
      icon: TrendingUp
    },
    {
      title: 'Collaborative Excellence',
      description: 'We achieve the best results through partnership, open communication, and shared goals.',
      icon: Users
    },
    {
      title: 'Quality Commitment',
      description: 'We maintain the highest standards in everything we deliver, ensuring excellence in every interaction.',
      icon: Star
    }
  ];

  return (
    <div className="pt-20 bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 gradient-subtle">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16" data-animate>
            <h1 className="text-hero text-accent mb-6">
              Our Values & Principles
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The foundation of our approach to transforming individuals and organizations through purposeful, evidence-based, and human-centered solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16" data-animate>
            <h2 className="text-section text-accent mb-6">
              Core Values
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              These values guide every decision we make and every solution we create.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value) => {
              const IconComponent = value.icon;
              return (
                <Card key={value.title} className="group hover-glow" data-animate>
                  <CardHeader className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                      <IconComponent className={`h-8 w-8 ${value.color}`} />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Guiding Principles */}
      <section className="py-16 lg:py-24 gradient-subtle">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16" data-animate>
            <h2 className="text-section text-accent mb-6">
              Guiding Principles
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The principles that shape our approach to every engagement and relationship.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {principles.map((principle) => {
              const IconComponent = principle.icon;
              return (
                <div key={principle.title} className="text-center" data-animate>
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
                    <IconComponent className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{principle.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="border-2 border-primary/20 rounded-3xl p-8 lg:p-12 bg-background/50 backdrop-blur-sm" data-animate>
            <div className="text-center">
              <h2 className="text-section text-accent mb-8">
                Our Mission
              </h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
                To empower individuals and organizations to unlock their full potential through personalized coaching, 
                strategic HR consulting, and transformative learning experiences. We believe that with the right guidance, 
                tools, and support, every person and organization can achieve extraordinary results.
              </p>
              <p className="text-lg text-foreground font-medium">
                "Stay Curious. Keep Learning."
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ValuesPage;
