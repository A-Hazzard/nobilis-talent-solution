import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const ValuesSection = () => {
  const values = [
    {
      title: 'People at the Heart',
      desc: 'Every strategy we design begins with the human experience – unlocking potential and honoring the unique value each person brings.',
    },
    {
      title: 'Trusted Partnerships',
      desc: 'We work alongside you as a strategic partner, building solutions together that fit your goals, culture, and vision.',
    },
    {
      title: 'Integrity in Action',
      desc: 'We lead with transparency, authenticity, and accountability. Recommendations are grounded in what\'s right for your people and business.',
    },
    {
      title: 'Growth as a Way of Life',
      desc: 'We champion continuous learning, adaptability, and resilience — turning challenges into catalysts for transformation.',
    },
    {
      title: 'Measurable Impact',
      desc: 'We focus on strategies that produce real, measurable outcomes.',
    },
  ];

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8">Values</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {values.map((v) => (
            <Card key={v.title} className="h-full">
              <CardHeader>
                <CardTitle className="text-xl">{v.title}</CardTitle>
                <CardDescription>{v.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;
