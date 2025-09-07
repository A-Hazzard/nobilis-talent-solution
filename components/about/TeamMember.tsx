import { CheckCircle } from "lucide-react";
import Image from "next/image";
import type { TeamMemberProps } from '@/lib/types/components';

const TeamMember = ({
  name,
  title,
  bio,
  image,
  achievements,
  achievementsBold = false,
  reverseLayout = false,
}: TeamMemberProps) => {
  return (
    <div className="border-2 border-primary/20 rounded-3xl p-6 lg:p-8 bg-background/50 backdrop-blur-sm">
      <div
        className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
          reverseLayout ? "lg:grid-flow-col-dense" : ""
        }`}
      >
        {/* Image and stats */}
        <div
          className={`relative ${reverseLayout ? "lg:col-start-2" : ""}`}
          data-animate
        >
          <div className="relative z-10">
            <div className="relative w-full max-w-sm sm:max-w-md mx-auto">
              <Image
                src={image}
                alt={`${name} - ${title}`}
                width={1200}
                height={1500}
                quality={90}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                className="w-full h-auto object-cover rounded-3xl shadow-strong hover-float"
              />
            </div>
          </div>

                     {/* Floating achievement cards */}
           <div className="absolute -top-20 md:-top-24 lg:-top-44 -right-6 animate-float hidden sm:block">
            <div className="card-elevated bg-primary text-white p-4 sm:p-6 max-w-40 sm:max-w-48 flex flex-col items-center">
              <CheckCircle className="h-6 w-6 text-white mb-2" />
              <div className="text-2xl sm:text-3xl font-bold mb-1">
                {achievements[0]?.split("+")[0]}+
              </div>
              <div className="text-xs sm:text-sm opacity-90">
                {achievements[0]?.split("+")[1]?.trim()}
              </div>
            </div>
          </div>

                     <div
             className="absolute -bottom-28 md:-bottom-32 lg:-bottom-40 -left-6 animate-float hidden sm:block"
             style={{ animationDelay: "2s" }}
           >
            <div className="card-elevated bg-secondary text-white p-4 sm:p-6 max-w-40 sm:max-w-48 flex flex-col items-center">
              <CheckCircle className="h-6 w-6 text-white mb-2" />
              <div className="text-2xl sm:text-3xl font-bold mb-1">
                {achievements[1]?.split("+")[0]}+
              </div>
              <div className="text-sm sm:text-sm opacity-90">
                {achievements[1]?.split("+")[1]?.trim()}
              </div>
            </div>
          </div>
        </div>

                 {/* Content */}
         <div
           className={`md:mt-32 lg:mt-8 ${reverseLayout ? "lg:col-start-1" : ""}`}
           data-animate
         >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl my-6">
            {name}
          </h2>
          <p className="text-xl text-primary font-semibold mb-6">{title}</p>

          <div className="space-y-4 text-base leading-7 text-foreground/80 my-8">
            {bio.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Achievements - Improved responsiveness */}
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-2 sm:gap-3 rounded-xl border bg-card p-3 sm:p-4 text-card-foreground hover:shadow-md transition-shadow duration-200"
                >
                  <CheckCircle className="h-6 w-6 text-primary mb-2" />
                  <p
                    className={`text-xs sm:text-sm leading-relaxed ${
                      achievementsBold ? "font-bold" : ""
                    }`}
                  >
                    {achievement}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMember;
