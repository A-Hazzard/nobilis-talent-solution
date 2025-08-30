import Link from "next/link";
import TeamMember from "./about/TeamMember";
import { teamImages } from "@/lib/constants/images";

const AboutSection = () => {
  const kareemAchievements = [
    "200+ entrepreneurs and team members trained",
    "10+ keynotes delivered",
    "100+ leaders and entrepreneurs coached",
    "20+ businesses successfully launched",
  ];

  // Placeholder for wife's achievements - you can update these when you have her bio
  const wifeAchievements = [
    "15+ years in organizational development",
    "500+ teams transformed",
    "25+ strategic partnerships built",
    "95% client satisfaction rate",
  ];

  return (
    <section id="about" className="py-16 lg:py-24 gradient-subtle">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Meet the Team Header */}
        <div className="text-center mb-20 md:mb-24 lg:mb-28" data-animate>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Meet the Team
          </h1>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            We're passionate about helping organizations unlock their strategic
            potential by leveraging the growth of people. Meet the dedicated
            professionals behind our mission.
          </p>
        </div>

        {/* Kareem's Section */}
        <div className="mb-24 md:mb-32 lg:mb-40" data-animate>
          <TeamMember
            name="Kareem T. Payne"
            title="Human Capital Alchemist & Coach"
            bio={`Kareem T. Payne is a purposeful, passionate, and results-driven Human Capital Alchemist & Coach. With a career spanning diverse sectors—Retail, Hospitality, Financial Services, Energy, Manufacturing, Distribution, and Entrepreneurship—his work has impacted organizations and communities across the Caribbean and North America.

He specializes in helping organizations unlock their strategic potential by leveraging the growth of people. Through coaching, leadership development, and performance consulting, Kareem equips leaders and teams with the tools they need to thrive. As a qualified Emotional Intelligence (EI) practitioner, he champions EI as a catalyst for personal transformation.

Whether in a boardroom, training room, or community hall, his message is consistent: growth is a choice, and learning never stops. A lifelong learner with a growth mindset, Kareem embraces the philosophy — "Stay Curious. Keep Learning."`}
            image={teamImages.kareem}
            achievements={kareemAchievements}
            achievementsBold={true}
          />
        </div>

        {/* Wife's Section - Placeholder */}
        <div className="mb-24 md:mb-32 lg:mb-40" data-animate>
          <TeamMember
            name="Sarah Johnson"
            title="Organizational Development Specialist"
            bio={`Sarah Johnson brings over 15 years of expertise in organizational development and team transformation. With a background in psychology and business administration, she specializes in creating sustainable change within organizations through strategic people development initiatives.

Her approach combines evidence-based methodologies with practical business acumen, helping teams navigate complex organizational challenges while building stronger, more cohesive work environments. Sarah has worked across various industries including healthcare, technology, and non-profit sectors, consistently delivering measurable improvements in team performance and employee engagement.

Sarah believes that the foundation of any successful organization lies in its people. She champions inclusive leadership practices and helps leaders develop the emotional intelligence necessary to inspire and motivate their teams. Her collaborative style and deep understanding of human behavior make her an invaluable partner in organizational transformation efforts.`}
            image={teamImages.sarah}
            achievements={wifeAchievements}
            achievementsBold={true}
            reverseLayout={true}
          />
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16" data-animate>
          <div className="border-2 border-primary/20 rounded-3xl p-8 bg-background/50 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Transform Your Organization?
            </h3>
            <p className="text-foreground/70 mb-8 max-w-2xl mx-auto">
              Let's work together to unlock your team's potential and drive
              sustainable growth through strategic human capital development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="btn-primary">
                Let's Work Together
              </a>
              <Link href="/" className="btn-secondary">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
