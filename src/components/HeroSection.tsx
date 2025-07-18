import { ArrowRight, Calendar, Users, TrendingUp } from 'lucide-react';
import heroImage from '@/assets/hero-leadership.jpg';

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Leadership coaching" 
          className="w-full h-full object-cover"
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
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-up">
          <h1 className="text-hero text-white mb-6">
            Transform Your
            <span className="bg-gradient-to-r from-primary-light to-secondary bg-clip-text text-transparent block">
              Leadership Impact
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl leading-relaxed">
            Unlock your team's potential with proven leadership strategies that drive results. 
            Join hundreds of successful leaders who've transformed their organizations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <a
              href="#contact"
              className="btn-primary group inline-flex items-center justify-center"
            >
              Book Your Strategy Call
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            
            <a
              href="#services"
              className="btn-outline bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-accent"
            >
              Explore Services
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
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

        {/* Right side - Contact form card */}
        <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <div className="card-elevated bg-white/95 backdrop-blur-sm">
            <div className="text-center mb-6">
              <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-accent mb-2">Ready to Get Started?</h3>
              <p className="text-muted-foreground">Book a free 30-minute strategy session</p>
            </div>
            
            <form className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-xl border border-card-border focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 rounded-xl border border-card-border focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Company Name"
                  className="w-full px-4 py-3 rounded-xl border border-card-border focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                />
              </div>
              <div>
                <textarea
                  placeholder="What leadership challenges are you facing?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-card-border focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                className="btn-primary w-full"
              >
                Schedule Free Consultation
              </button>
            </form>
            
            <p className="text-xs text-muted-foreground text-center mt-4">
              No spam. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;