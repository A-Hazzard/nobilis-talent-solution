import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { generalImages } from '@/lib/constants/images';

const CompanySection = () => {
  return (
    <section className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="border-2 border-primary/20 rounded-3xl p-6 lg:p-8 bg-background/50 backdrop-blur-sm">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                  About Nobilis Talent Solutions
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
                  
                  <div className="mt-6">
                    <Link href="/about">
                      <Button className="btn-primary group">
                        Learn More About Us
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-medium">
                  <Image
                    src={generalImages.chart}
                    alt="Growth metrics chart"
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
      </div>  
    </section>
  );
};

export default CompanySection;
 
