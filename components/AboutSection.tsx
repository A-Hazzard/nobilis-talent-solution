import React, { useEffect, useRef } from "react";
import Link from "next/link";
import TeamMember from "./about/TeamMember";
import { teamImages } from "@/lib/constants/images";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const AboutSection = () => {
  // Refs for GSAP animations
  const headerRef = useRef<HTMLDivElement>(null);
  const kareemRef = useRef<HTMLDivElement>(null);
  const jeniferRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const kareemAchievements = [
    "200+ entrepreneurs and team members trained",
    "10+ keynotes delivered",
    "100+ leaders and entrepreneurs coached",
    "20+ businesses successfully launched",
  ];

  // Jenifer's achievements
  const wifeAchievements = [
    "15+ years in organizational development",
    "200+ teams transformed",
    "50+ strategic partnerships built",
    "100% client satisfaction rate",
  ];

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header section animation
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.children,
          {
            opacity: 0,
            y: 50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power2.out",
          }
        );
      }

      // Kareem's section animation
      if (kareemRef.current) {
        gsap.fromTo(
          kareemRef.current,
          {
            opacity: 0,
            y: 80,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: kareemRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Jenifer's section animation
      if (jeniferRef.current) {
        gsap.fromTo(
          jeniferRef.current,
          {
            opacity: 0,
            y: 80,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: jeniferRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // CTA section animation
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          {
            opacity: 0,
            y: 30,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ctaRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    });

    return () => ctx.revert(); // Cleanup
  }, []);

  return (
    <section id="about" className="py-16 lg:py-24 gradient-subtle">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Meet the Team Header */}
        <div ref={headerRef} className="text-center mb-20 md:mb-24 lg:mb-28">
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
        <div ref={kareemRef} className="mb-24 md:mb-32 lg:mb-40">
          <TeamMember
            name="Kareem T. Payne"
            title="Founder & Chief Talent Strategist"
            bio={`Kareem T. Payne is a purposeful, passionate, and results-driven Founder & Chief Talent Strategist. With a career spanning diverse sectors—Retail, Hospitality, Financial Services, Energy, Manufacturing, Distribution, and Entrepreneurship—his work has impacted organizations and communities across the Caribbean and North America.

He specializes in helping organizations unlock their strategic potential by leveraging the growth of people. Through coaching, leadership development, and performance consulting, Kareem equips leaders and teams with the tools they need to thrive. As a qualified Emotional Intelligence (EI) practitioner, he champions EI as a catalyst for personal transformation.

Whether in a boardroom, training room, or community hall, his message is consistent: growth is a choice, and learning never stops. A lifelong learner with a growth mindset, Kareem embraces the philosophy — "Stay Curious. Keep Learning."`}
            image={teamImages.kareem}
            achievements={kareemAchievements}
            achievementsBold={true}
          />
        </div>

        {/* Jennifer's Section */}
        <div ref={jeniferRef} className="mb-24 md:mb-32 lg:mb-40">
          <TeamMember
            name="Jennifer Payne"
            title="Co-Founder & Lead Organizational Development Partner"
            bio={`Jennifer Payne brings over 15 years of expertise in organizational development and team transformation. With a background in Human Resources and business administration, she specializes in creating sustainable change within organizations through strategic people development initiatives.

Her approach combines evidence-based methodologies with practical business acumen, helping teams navigate complex organizational challenges while building stronger, more cohesive work environments. Jennifer worked with Manufacturing, Media & Entertainment, Consumer Packaging across various industries, consistently delivering measurable improvements in team performance and employee engagement.

Jennifer believes that the foundation of any successful organization lies in its people. She champions inclusive leadership practices and helps leaders develop the emotional intelligence necessary to inspire and motivate their teams. Her collaborative style and deep understanding of human behavior make her an invaluable partner in organizational transformation efforts.`}
            image={teamImages.sarah}
            achievements={wifeAchievements}
            achievementsBold={true}
            reverseLayout={true}
          />
        </div>

        {/* Call to Action */}
        <div ref={ctaRef} className="text-center mt-16">
          <div className="border-2 border-primary/20 rounded-3xl p-8 bg-background/50 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Transform Your Organization?
            </h3>
            <p className="text-foreground/70 mb-8 max-w-2xl mx-auto">
              Let's work together to unlock your team's potential and drive
              sustainable growth through strategic human capital development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="btn-primary font-bold">
                Let's Work Together
              </a>
              <Link href="/" className="btn-secondary font-bold">
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
