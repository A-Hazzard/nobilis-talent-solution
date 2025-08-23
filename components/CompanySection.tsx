import Image from 'next/image';

const CompanySection = () => {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div data-animate>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              About Nobilis Talent Solutions LLC
            </h2>
            
            <div className="space-y-4 text-base leading-7 text-foreground/80">
              <p>
                We transform how leaders, teams, and organizations unlock their full potential. Our approach is strategic and human-centered — grounded in evidence-based practices and tailored to your unique story, challenges, and goals.
              </p>
              <p>
                We don't just create plans; we create the conditions for sustainable change. We listen deeply, ask the right questions, and challenge assumptions to unlock new possibilities together.
              </p>
              <p>
                If you're ready to reimagine what you or your organization can achieve, let's connect and start the transformation journey.
              </p>
            </div>
          </div>

          <div className="relative" data-animate>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-medium">
              <Image
                src="https://images.unsplash.com/photo-1557800636-894a64c1696f?w=1600&h=1200&fit=crop&crop=center"
                alt="Team collaboration"
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.style.backgroundColor = '#f3f4f6';
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanySection;
