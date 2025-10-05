'use client';

import { ArrowRight, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';
import BookNowButton from '@/components/BookNowButton';

const HeroSection = () => {
  const scrollToNextSection = () => {
    const servicesElement = document.getElementById('services');
    if (servicesElement) {
      servicesElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      // Fallback: scroll down by viewport height
      window.scrollBy({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }
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
          src="/assets/hero.jpg" 
          alt="Leadership coaching" 
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-accent/90 via-accent/70 to-primary/60"></div>
      </div>


      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="hero-text">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 hero-stagger">
              Where Strategy Meets Humanity
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed hero-stagger">
              We help leaders, teams, and organizations unlock their potential, align culture with vision, and deliver sustainable results.
            </p>

            <p className="text-base sm:text-lg text-white/85 mb-8 max-w-3xl mx-auto leading-relaxed hero-stagger">
              Helping People and Organizations Thrive — Our work blends strategic insight with a deep understanding of human behavior—because lasting success happens when people and strategy work in harmony.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12 hero-stagger justify-center">
              <BookNowButton
                variant="outline"
                className=" bg-teal-500 backdrop-blur-sm border-teal-400/50 text-white hover:bg-teal-500/10 hover:text-white transition-all duration-300 group inline-flex items-center justify-center px-6 py-4 sm:px-8 sm:py-8 text-base sm:text-lg rounded-full"
                showIcon={false}
              >
                Book Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </BookNowButton>
              
              <a
                href="#services"
                className="btn-outline bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-accent px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg"
              >
                Explore Services
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator - clickable */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex justify-center z-20">
        <button 
          onClick={scrollToNextSection}
          className="animate-bounce hover:scale-110 transition-all duration-300 ease-in-out group cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-full"
          aria-label="Scroll to services section"
        >
          <div className="w-8 h-12 border-2 border-white/70 rounded-full flex flex-col items-center justify-center group-hover:border-white transition-all duration-300 ease-in-out group-hover:shadow-lg bg-white/10 backdrop-blur-sm">
            <ChevronDown className="w-4 h-4 text-white/70 group-hover:text-white animate-pulse transition-all duration-300 ease-in-out group-hover:translate-y-1" />
          </div>
        </button>
      </div>
    </section>
  );
};

export default HeroSection;