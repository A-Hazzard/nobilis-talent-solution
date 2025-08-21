'use client';

import { ArrowRight, Calendar, Users, TrendingUp, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';

const HeroSection = () => {
  const scrollToNextSection = () => {
    document.getElementById('about')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  useEffect(() => {
    // Add stagger animations to hero elements
    const elements = document.querySelectorAll('.hero-stagger');
    elements.forEach((el, index) => {
      (el as HTMLElement).style.animationDelay = `${index * 0.2}s`;
    });
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/assets/hero-leadership.jpg" 
          alt="Leadership coaching" 
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-accent/90 via-accent/70 to-primary/60"></div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 right-10 animate-float hidden lg:block">
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-white">
          <Users className="w-8 h-8 mb-2" />
          <p className="text-sm font-semibold">500+ Leaders Coached</p>
        </div>
      </div>
      
      <div className="absolute top-40 right-40 animate-float hidden lg:block" style={{ animationDelay: '2s' }}>
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-white">
          <TrendingUp className="w-8 h-8 mb-2" />
          <p className="text-sm font-semibold">98% Success Rate</p>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="hero-text">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 hero-stagger">
              Where strategy meets humanity, transformation happens.
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed hero-stagger">
              I help leaders, teams, and organizations unlock their potential, align culture with vision, and deliver sustainable results.
            </p>

            <p className="text-base sm:text-lg text-white/85 mb-8 max-w-3xl mx-auto leading-relaxed hero-stagger">
              Helping People and Organizations Thrive — Our work blends strategic insight with a deep understanding of human behavior—because lasting success happens when people and strategy work in harmony.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12 hero-stagger justify-center">
              <button
                onClick={() => window.open(process.env.NEXT_PUBLIC_CALENDLY_URL, '_blank')}
                className="btn-primary group inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg"
              >
                Book Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <a
                href="#services"
                className="btn-outline bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-accent px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg"
              >
                Explore Services
              </a>
            </div>

            {/* Value Proposition */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-12 hero-stagger">
              <h3 className="text-xl font-semibold text-white mb-4">Why Choose Kareem Payne Leadership?</h3>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Proven Results</h4>
                  <p className="text-white/80 text-sm">98% success rate with measurable improvements</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Strategic Approach</h4>
                  <p className="text-white/80 text-sm">Customized solutions for your unique challenges</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Free Consultation</h4>
                  <p className="text-white/80 text-sm">30-minute strategy session at no cost</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-white/20 hero-stagger">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">500+</div>
                <div className="text-sm text-white/80">Leaders Coached</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">98%</div>
                <div className="text-sm text-white/80">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">5+</div>
                <div className="text-sm text-white/80">Years Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator - clickable */}
      <button 
        onClick={scrollToNextSection}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hover:scale-110 transition-transform group cursor-pointer"
        aria-label="Scroll to next section"
      >
        <div className="w-8 h-12 border-2 border-white/70 rounded-full flex flex-col items-center justify-center group-hover:border-white transition-colors">
          <ChevronDown className="w-4 h-4 text-white/70 group-hover:text-white animate-pulse" />
        </div>
      </button>
    </section>
  );
};

export default HeroSection;