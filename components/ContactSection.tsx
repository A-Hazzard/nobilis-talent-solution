import { Phone, Mail, MapPin, Calendar, Send, Clock } from 'lucide-react';

const ContactSection = () => {
  return (
    <section id="contact" className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-section text-accent mb-6">
            Let's Start Your Leadership Journey
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ready to unlock your leadership potential? Get in touch to schedule 
            your free consultation and discover how we can help you achieve your goals.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="animate-fade-up">
            <div className="card-feature">
              <div className="flex items-center mb-8">
                <Calendar className="w-8 h-8 text-primary mr-3" />
                <h3 className="text-2xl font-bold text-accent">Book Your Strategy Session</h3>
              </div>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-accent mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-card-border focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-accent mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-card-border focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-card-border focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl border border-card-border focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-card-border focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                    placeholder="Your Company"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent mb-2">
                    What leadership challenges are you facing? *
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-card-border focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth resize-none"
                    placeholder="Tell us about your specific leadership challenges, team dynamics, or organizational goals..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent mb-2">
                    Preferred Contact Method
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="contact-method"
                        value="email"
                        className="mr-2 text-primary focus:ring-primary"
                        defaultChecked
                      />
                      Email
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="contact-method"
                        value="phone"
                        className="mr-2 text-primary focus:ring-primary"
                      />
                      Phone
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full group"
                >
                  Send Message & Book Consultation
                  <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <p className="text-sm text-muted-foreground mt-4">
                * Required fields. We'll respond within 24 hours.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="space-y-8">
              {/* Contact Details */}
              <div className="card-elevated">
                <h3 className="text-2xl font-bold text-accent mb-6">Get In Touch</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mr-4">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-accent">Phone</div>
                      <a href="tel:678-920-6605" className="text-primary hover:underline">
                        (678) 920-6605
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center mr-4">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-accent">Email</div>
                      <a href="mailto:kareempayne11@gmail.com" className="text-primary hover:underline">
                        kareempayne11@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-accent to-accent-light rounded-xl flex items-center justify-center mr-4">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-accent">Location</div>
                      <div className="text-muted-foreground">Trinidad & Tobago</div>
                      <div className="text-sm text-muted-foreground">Available globally via video</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="card-elevated bg-gradient-subtle">
                <div className="flex items-center mb-4">
                  <Clock className="w-8 h-8 text-primary mr-3" />
                  <h4 className="text-xl font-bold text-accent">Quick Response</h4>
                </div>
                <p className="text-muted-foreground mb-4">
                  We understand that leadership challenges require prompt attention. 
                  You can expect a response within 24 hours.
                </p>
                <div className="text-sm text-primary font-semibold">
                  ✓ Free 30-minute strategy session included
                </div>
              </div>

              {/* Calendly Integration Placeholder */}
              <div className="card-elevated bg-primary text-white">
                <h4 className="text-xl font-bold mb-4">Schedule Directly</h4>
                <p className="mb-6 opacity-90">
                  Prefer to book immediately? Use our online calendar to select 
                  a time that works for you.
                </p>
                <button className="bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-smooth w-full">
                  Open Calendar (Calendly)
                </button>
                <p className="text-xs opacity-75 mt-3">
                  All appointments are confirmed via email
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center animate-fade-up">
          <div className="inline-flex items-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
              Confidential Consultations
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
              No Obligation
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
              24hr Response Time
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;