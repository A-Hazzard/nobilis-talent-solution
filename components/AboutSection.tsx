import { CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const AboutSection = () => {
  const achievements = [
    "4000+ entrepreneurs and team members trained",
    "10+ keynotes delivered",
    "100+ leaders and entrepreneurs coached",
    "20+ businesses successfully launched",
  ];

  return (
    <section id="about" className="py-16 lg:py-24 gradient-subtle">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Unified border around entire section */}
        <div className="border-2 border-primary/20 rounded-3xl p-6 lg:p-8 bg-background/50 backdrop-blur-sm">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
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
                <div className="card-elevated bg-primary text-white p-4 sm:p-6 max-w-40 sm:max-w-48 flex flex-col items-center">
                  <CheckCircle className="h-6 w-6 text-white mb-2" />
                  <div className="text-2xl sm:text-3xl font-bold mb-1">
                    4000+
                  </div>
                  <div className="text-xs sm:text-sm opacity-90">
                    People Trained
                  </div>
                </div>
              </div>

              <div
                className="absolute -bottom-24 -left-6 animate-float hidden sm:block"
                style={{ animationDelay: "2s" }}
              >
                <div className="card-elevated bg-secondary text-white p-4 sm:p-6 max-w-40 sm:max-w-48 flex flex-col items-center">
                  <CheckCircle className="h-6 w-6 text-white mb-2" />
                  <div className="text-2xl sm:text-3xl font-bold mb-1">
                    100+
                  </div>
                  <div className="text-sm sm:text-sm opacity-90">
                    Leaders Coached
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Content */}
            <div className="md:mt-20" data-animate>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                About Kareem Payne
              </h2>

              <div className="space-y-4 text-base leading-7 text-foreground/80 mb-8">
                <p>
                  Kareem T. Payne is a purposeful, passionate, and
                  results-driven Human Capital Alchemist & Coach. With a career
                  spanning diverse sectors—Retail, Hospitality, Financial
                  Services, Energy, Manufacturing, Distribution, and
                  Entrepreneurship—his work has impacted organizations and
                  communities across the Caribbean and North America.
                </p>
                <p>
                  He specializes in helping organizations unlock their strategic
                  potential by leveraging the growth of people. Through
                  coaching, leadership development, and performance consulting,
                  Kareem equips leaders and teams with the tools they need to
                  thrive. As a qualified Emotional Intelligence (EI)
                  practitioner, he champions EI as a catalyst for personal
                  transformation.
                </p>
                <p>
                  Whether in a boardroom, training room, or community hall, his
                  message is consistent: growth is a choice, and learning never
                  stops. A lifelong learner with a growth mindset, Kareem
                  embraces the philosophy — "Stay Curious. Keep Learning."
                </p>
              </div>

              {/* Achievements - Made metrics bold */}
              <div className="mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-2 sm:gap-3 rounded-xl border bg-card p-3 sm:p-4 text-card-foreground hover:shadow-md transition-shadow duration-200"
                    >
                      <CheckCircle className="h-6 w-6 text-primary mb-2" />
                      <p className="text-xs sm:text-sm leading-relaxed font-bold">
                        {achievement}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <a href="#contact" className="btn-primary">
                  Let's Work Together
                </a>
                <Link href="/" className="btn-secondary">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
