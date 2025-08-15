import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, FileText, Star } from 'lucide-react';

type ServiceSlug = 'executive-coaching' | 'team-development' | 'leadership-workshops';

const SERVICE_CONTENT: Record<ServiceSlug, {
  title: string;
  subtitle: string;
  description: string;
  outcomes: string[];
  modules: { title: string; points: string[] }[];
  packages: { name: string; price: number; details: string[] }[];
  testimonials: { name: string; role: string; content: string; rating: number }[];
}> = {
  'executive-coaching': {
    title: 'Executive Coaching',
    subtitle: 'Transform Your Leadership Potential',
    description:
      'One‑on‑one coaching designed to unlock your leadership potential, accelerate decision‑making, and drive organizational results. Engagements are tailored to your goals with measurable outcomes.',
    outcomes: [
      'Clarity on strategic priorities and leadership brand',
      'Improved executive communication and influence',
      'Stronger decision velocity and focus under pressure',
      'Accountability systems that sustain behavior change',
    ],
    modules: [
      { title: 'Discovery & Diagnostics', points: ['360° stakeholder interviews', 'Leadership assessments', 'Success criteria + plan'] },
      { title: 'Performance Routines', points: ['Weekly priorities system', 'Delegation operating rhythm', 'Feedback loops'] },
      { title: 'Executive Presence', points: ['High‑stakes messaging', 'Narrative and story structure', 'Conflict and negotiation'] },
    ],
    packages: [
      { name: 'Starter (8 weeks)', price: 1800, details: ['Bi‑weekly 60‑min sessions', 'Email support', 'Personal action plan'] },
      { name: 'Growth (12 weeks)', price: 2600, details: ['Weekly 60‑min sessions', 'Shadowing + feedback', 'Stakeholder check‑ins'] },
      { name: 'Elite (6 months)', price: 5200, details: ['Weekly sessions', 'On‑call support', 'Executive offsite prep'] },
    ],
    testimonials: [
      { name: 'Sarah Johnson', role: 'CEO, TechStart', content: 'Kareem helped me lead with clarity and confidence through a make‑or‑break transition.', rating: 5 },
      { name: 'Michael Chen', role: 'VP Operations, GlobalCorp', content: 'Every session produced concrete actions and measurable improvements.', rating: 5 },
    ],
  },
  'team-development': {
    title: 'Team Development',
    subtitle: 'Build High‑Performing Teams',
    description:
      'A practical program to align goals, strengthen collaboration, and install lightweight systems that raise team throughput and trust.',
    outcomes: [
      'Shared goals and decision principles',
      'Clear roles and handshake agreements',
      'Candid feedback culture with psychological safety',
      'Observable velocity gains (lead time, cycle time, quality)',
    ],
    modules: [
      { title: 'Team Diagnostic', points: ['Ways‑of‑working audit', 'Role clarity + RACI', 'Workflow bottlenecks'] },
      { title: 'Collaboration Toolkit', points: ['Meeting OS', 'Decision records', 'Feedback & retros'] },
      { title: 'Execution Systems', points: ['Quarterly planning', 'Scorecards & metrics', 'Risk/issue cadences'] },
    ],
    packages: [
      { name: 'Workshop (1 day)', price: 3500, details: ['On‑site or virtual', 'Current‑state mapping', '90‑day plan'] },
      { name: 'Sprint (6 weeks)', price: 7800, details: ['Weekly facilitation', 'Playbook implementation', 'Metrics dashboard'] },
    ],
    testimonials: [
      { name: 'Lisa Rodriguez', role: 'HR Director, InnovateCo', content: 'Productivity up 40% in eight weeks. The team is finally rowing together.', rating: 5 },
      { name: 'David Thompson', role: 'Team Lead, Creative Agency', content: 'Turned chaos into flow. Meetings are shorter and decisions stick.', rating: 5 },
    ],
  },
  'leadership-workshops': {
    title: 'Leadership Workshops',
    subtitle: 'Intensive, Practical Skill‑Building',
    description:
      'Hands‑on workshops that equip leaders with the skills to communicate, coach, and execute. Designed for immediate on‑the‑job application.',
    outcomes: [
      'Stronger coaching and feedback skills',
      'Clearer communication under pressure',
      'Better prioritization and execution habits',
    ],
    modules: [
      { title: 'Coach Like a Leader', points: ['GROW model in practice', 'Live role‑play feedback', 'Actionable coaching plans'] },
      { title: 'Executive Communication', points: ['Message map', 'Story + data', 'Q&A handling'] },
      { title: 'Operating as a System', points: ['Prioritization ladders', 'Decision logs', 'Weekly review cadence'] },
    ],
    packages: [
      { name: 'Half‑Day', price: 2400, details: ['Single topic', 'Templates + playbooks', 'Follow‑up office hours'] },
      { name: 'Full Day', price: 4200, details: ['Two modules', 'Team artifacts created', 'Manager guide'] },
    ],
    testimonials: [
      { name: 'Jennifer Park', role: 'Founder, StartupXYZ', content: 'Most practical leadership training we have run. Team changed behavior next day.', rating: 5 },
      { name: 'Robert Williams', role: 'MD, FinanceCorp', content: 'High‑energy, high‑impact. The frameworks stuck.', rating: 5 },
    ],
  },
};

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const typedSlug = slug as ServiceSlug;
  const content = SERVICE_CONTENT[typedSlug];
  if (!content) return notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl">
            <p className="uppercase tracking-wide text-blue-100 mb-3">{content.subtitle}</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{content.title}</h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl">{content.description}</p>
            <div className="mt-8 flex gap-3 flex-wrap">
              <Button asChild className="bg-white text-blue-700 hover:bg-gray-100">
                <Link href={`/payment`}> <Calendar className="mr-2 h-5 w-5" /> Book a Consultation</Link>
              </Button>
              <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-blue-700">
                <Link href={`/resources`}> <FileText className="mr-2 h-5 w-5" /> View Resources</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Outcomes You Can Expect</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.outcomes.map((item, i) => (
            <Card key={i}>
              <CardContent className="p-5 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <p className="text-gray-700">{item}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Program Modules */}
      <section className="container mx-auto px-4 pb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Program Modules</h2>
        <div className="grid lg:grid-cols-3 gap-6">
          {content.modules.map((mod, i) => (
            <Card key={i} className="border-2 border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">{mod.title}</h3>
                <ul className="space-y-2">
                  {mod.points.map((p, idx) => (
                    <li key={idx} className="flex gap-2 text-gray-700">
                      <span className="text-primary">•</span> {p}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section className="container mx-auto px-4 pb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Packages</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.packages.map((pkg, i) => (
            <Card key={i} className="border-2">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{pkg.name}</h3>
                <p className="text-3xl font-bold mb-3">${pkg.price.toLocaleString()}</p>
                <ul className="space-y-2 mb-4">
                  {pkg.details.map((d, idx) => (
                    <li key={idx} className="text-gray-700">- {d}</li>
                  ))}
                </ul>
                <Button asChild className="w-full">
                  <Link href={`/payment`}>Select</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">What Clients Say</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.testimonials.map((t, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(t.rating)].map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="italic text-gray-700 mb-4">"{t.content}"</p>
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-gray-500">{t.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}


