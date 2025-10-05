import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { HeartHandshake, Handshake, ShieldCheck, Rocket, Target } from 'lucide-react';

const ValuesSection = () => {
  const values = [
    {
      title: 'People at the Heart',
      desc: 'Every strategy we design begins with the human experience — unlocking potential and honoring the unique value each person brings.',
      icon: HeartHandshake,
    },
    {
      title: 'Trusted Partnerships',
      desc: 'We work alongside you as a strategic partner, building solutions together that fit your goals, culture, and vision.',
      icon: Handshake,
    },
    {
      title: 'Integrity in Action',
      desc: "We lead with transparency, authenticity, and accountability. Recommendations are grounded in what's right for your people and business.",
      icon: ShieldCheck,
    },
    {
      title: 'Growth as a Way of Life',
      desc: 'We champion continuous learning, adaptability, and resilience — turning challenges into catalysts for transformation.',
      icon: Rocket,
    },
    {
      title: 'Measurable Impact',
      desc: 'We focus on strategies that produce real, measurable outcomes.',
      icon: Target,
    },
  ];

  return (
    <section className="py-12 lg:py-20 relative">
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_20%_20%,_#000,_transparent_300px)]"></div>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8 text-center">Values</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* First row - 3 cards */}
          {values.slice(0, 3).map((v) => {
            const Icon = v.icon as React.ComponentType<{ className?: string }>;
            return (
              <Card
                key={v.title}
                className="h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/30 cursor-pointer group"
              >
                <CardHeader className="transition-colors duration-300 group-hover:bg-primary/5">
                  <div className="flex items-center mb-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mr-3">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl transition-colors duration-300 group-hover:text-primary">{v.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base transition-colors duration-300 group-hover:text-foreground/80">{v.desc}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
        
        {/* Second row - 2 centered cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto mt-6">
          {values.slice(3, 5).map((v) => {
            const Icon = v.icon as React.ComponentType<{ className?: string }>;
            return (
              <Card
                key={v.title}
                className="h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/30 cursor-pointer group"
              >
                <CardHeader className="transition-colors duration-300 group-hover:bg-primary/5">
                  <div className="flex items-center mb-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mr-3">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl transition-colors duration-300 group-hover:text-primary">{v.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base transition-colors duration-300 group-hover:text-foreground/80">{v.desc}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;

