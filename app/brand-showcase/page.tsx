import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'

export const metadata = {
	title: 'Nobilis Talent Solutions — Where strategy meets humanity',
	description:
		'Helping People and Organizations Thrive. Human Capital Alchemist and Coach helping leaders and teams unlock potential, navigate change, and build cultures where people and performance flourish.',
}

const services: Array<{ title: string; summary: string }> = [
	{
		title: 'Individual & Group Coaching — Grow with purpose.',
		summary:
			'Personalized coaching that sparks holistic growth, strengthens confidence, and helps individuals and teams be better.',
	},
	{
		title: 'Performance Management Design — Solutions to drive engagement and results.',
		summary:
			'We reimagine the approach to managing performance with more human, agile, and impactful systems.',
	},
	{
		title: 'Leadership Development Design — Leaders who inspire action.',
		summary:
			'From emerging leaders to seasoned execs, we craft experiences that grow leaders who inspire, influence, and deliver results.',
	},
	{
		title: 'Talent Strategy Development — People plans that work.',
		summary:
			'Design plans to attract, engage, retain, and grow the right people so your organization thrives long-term.',
	},
	{
		title: 'Succession & Workforce Planning Design — Ready for tomorrow, today.',
		summary:
			'Scalable plans that ensure the right people are ready for the right roles, minimizing risk and maximizing impact.',
	},
	{
		title: 'Training & Facilitation — Learning that sticks.',
		summary:
			'Interactive, engaging, and practical learning experiences that build skills and shift mindsets — in the room or online.',
	},
	{
		title: 'Competency Model Development — Defining what great looks like.',
		summary:
			'Define the skills, behaviors, and mindsets that drive success to guide hiring, development, and performance.',
	},
	{
		title: 'Targeted Talent Acquisition — The right people, right away.',
		summary:
			'Find and attract top talent that aligns with your culture and delivers on your strategy — strategic, data-informed, and human.',
	},
]

export default function BrandShowcasePage() {
	const serviceImages: string[] = [
		'https://images.unsplash.com/photo-1515165562835-c3b8bf5f7cf8?q=80&w=1200&auto=format&fit=crop',
		'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop',
		'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop',
		'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format&fit=crop',
		'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200&auto=format&fit=crop',
		'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop',
		'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1200&auto=format&fit=crop',
		'https://images.unsplash.com/photo-1521791136064-ff1f9b9ef0e6?q=80&w=1200&auto=format&fit=crop',
	]
	return (
		<main className="min-h-screen">
			{/* Hero */}
			<section className="relative isolate overflow-hidden">
				<div className="absolute inset-0 -z-10">
					<Image
						src="https://images.unsplash.com/photo-1531496730074-83e981fc6e46?q=80&w=1920&auto=format&fit=crop"
						alt="Leadership meeting"
						fill
						priority
						className="object-cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
				</div>

				<div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
					<div className="mx-auto max-w-3xl text-center text-white">
						<h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
							Where strategy meets humanity, transformation happens.
						</h1>
						<p className="mt-6 text-lg leading-8 text-white/90">
							I help leaders, teams, and organizations unlock their potential, align culture with
							vision, and deliver sustainable results.
						</p>
						<p className="mt-6 text-base leading-7 text-white/85">
							Helping People and Organizations Thrive — Our work blends strategic insight with a deep
							understanding of human behavior.
						</p>

						<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Link
								href="#services"
								className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-soft transition-smooth hover:shadow-strong"
							>
								Explore Services
								<ArrowRight className="ml-2 h-5 w-5" />
							</Link>
							<a
								href={process.env.NEXT_PUBLIC_CALENDLY_URL || '#contact'}
								className="inline-flex items-center rounded-md border border-white/30 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition-smooth hover:bg-white hover:text-accent"
							>
								Book Now
							</a>
						</div>
					</div>
				</div>
			</section>

			{/* About */}
			<section id="about" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
				<div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
					<div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-medium">
						<Image
							src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1600&auto=format&fit=crop"
							alt="Coaching session"
							fill
							className="object-cover"
						/>
					</div>
					<div>
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">About Kareem Payne</h2>
						<div className="mt-6 space-y-4 text-base leading-7 text-foreground/80">
							<p>
								Kareem T. Payne is a purposeful, passionate, and results-driven Human Capital Alchemist &
								Coach. With a career spanning diverse sectors—Retail, Hospitality, Financial Services, Energy,
								Manufacturing, Distribution, and Entrepreneurship—his work has impacted organizations and
								communities across the Caribbean and North America.
							</p>
							<p>
								He specializes in helping organizations unlock their strategic potential by leveraging the growth
								of people. Through coaching, leadership development, and performance consulting, Kareem equips
								leaders and teams with the tools they need to thrive. As a qualified Emotional Intelligence (EI)
								practitioner, he champions EI as a catalyst for personal transformation.
							</p>
							<p>
								Whether in a boardroom, training room, or community hall, his message is consistent: growth is a
								choice, and learning never stops. A lifelong learner with a growth mindset, Kareem embraces the
								philosophy — “Stay Curious. Keep Learning.”
							</p>
						</div>

						{/* Achievements */}
						<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
							{[
								'4000+ entrepreneurs and team members trained',
								'10+ keynotes delivered',
								'100+ leaders and entrepreneurs coached',
								'20+ businesses successfully launched',
							].map((item) => (
								<div key={item} className="flex items-start gap-3 rounded-xl border bg-card p-4 text-card-foreground">
									<CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
									<p className="text-sm">{item}</p>
								</div>
							))}
						</div>

						{/* Credentials */}
						<div className="mt-10">
							<h3 className="text-xl font-semibold">Credentials / Certifications</h3>
							<ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
								{[
									'MSc. Project Management & Evaluation',
									'BSc. Management with Psychology',
									'PMP (Project Management Professional)',
									'CPTD (Certified Professional in Talent Development)',
									'Certified Professional Coach (ICF Accredited Program)',
									'Certified Professional in Measuring the Impact of L&D',
								].map((cred) => (
									<li key={cred} className="flex items-start gap-2 text-sm">
										<span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
										{cred}
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* Company Intro */}
			<section className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-accent/10 via-primary/5 to-secondary/10 px-6 py-16 lg:px-8">
				<div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
					<div>
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">About Nobilis Talent Solutions LLC</h2>
						<p className="mt-6 text-base leading-7 text-foreground/80">
							We transform how leaders, teams, and organizations unlock their full potential. Our approach is
							strategic and human-centered — grounded in evidence-based practices and tailored to your unique
							story, challenges, and goals.
						</p>
						<p className="mt-4 text-base leading-7 text-foreground/80">
							We don’t just create plans; we create the conditions for sustainable change. We listen deeply,
							ask the right questions, and challenge assumptions to unlock new possibilities together.
						</p>
						<p className="mt-4 text-base leading-7 text-foreground/80">
							If you’re ready to reimagine what you or your organization can achieve, let’s connect and start
							the transformation journey.
						</p>
					</div>
					<div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-medium">
						<Image
							src="https://images.unsplash.com/photo-1557800636-894a64c1696f?q=80&w=1600&auto=format&fit=crop"
							alt="Team collaboration"
							fill
							className="object-cover"
						/>
					</div>
				</div>
			</section>

			{/* Values */}
			<section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
				<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Values</h2>
				<div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{[
						{
							title: 'People at the Heart',
							desc:
								'Every strategy we design begins with the human experience – unlocking potential and honoring the unique value each person brings.',
						},
						{
							title: 'Trusted Partnerships',
							desc:
								'We work alongside you as a strategic partner, building solutions together that fit your goals, culture, and vision.',
						},
						{
							title: 'Integrity in Action',
							desc:
								'We lead with transparency, authenticity, and accountability. Recommendations are grounded in what’s right for your people and business.',
						},
						{
							title: 'Growth as a Way of Life',
							desc:
								'We champion continuous learning, adaptability, and resilience — turning challenges into catalysts for transformation.',
						},
						{
							title: 'Measurable Impact',
							desc: 'We focus on strategies that produce real, measurable outcomes.',
						},
					].map((v) => (
						<Card key={v.title} className="h-full">
							<CardHeader>
								<CardTitle className="text-xl">{v.title}</CardTitle>
								<CardDescription>{v.desc}</CardDescription>
							</CardHeader>
						</Card>
					))}
				</div>
			</section>

			{/* Services */}
			<section id="services" className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">
				<div className="mb-8 text-center">
					<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Services</h2>
					<p className="mt-3 text-foreground/70">No pricing is displayed publicly. Explore offerings and connect to tailor solutions to your needs.</p>
				</div>
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{services.map((s, idx) => (
						<Card key={s.title} className="group h-full overflow-hidden">
							<div className="relative h-40 w-full overflow-hidden">
								<Image
									src={serviceImages[idx % serviceImages.length]}
									alt={s.title}
									fill
									className="object-cover transition-smooth group-hover:scale-105"
								/>
							</div>
							<CardHeader>
								<CardTitle className="text-lg">{s.title}</CardTitle>
								<CardDescription>{s.summary}</CardDescription>
							</CardHeader>
							<CardContent>
								<Link href="#contact" className="text-primary hover:underline">
									Let’s talk
								</Link>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			{/* Contact */}
			<section id="contact" className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
				<div className="rounded-3xl border bg-card p-8 text-card-foreground shadow-soft sm:p-10">
					<div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
						<div>
							<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Contact & Availability</h2>
							<p className="mt-4 text-sm text-foreground/80">
								Business Contact —{' '}
								<a href="mailto:nobilis.talent@gmail.com" className="underline">
									nobilis.talent@gmail.com
								</a>
							</p>
							<p className="mt-2 text-sm text-foreground/80">Service Availability — Available globally.</p>
						</div>
						<div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
							<Image
								src="https://images.unsplash.com/photo-1529336953121-ad2dd3d85f09?q=80&w=1600&auto=format&fit=crop"
								alt="Global collaboration"
								fill
								className="object-cover"
							/>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}


