'use client';

import { Mail, Phone, Linkedin, Instagram } from 'lucide-react';
import { useEffect, useState } from 'react';
import BookNowButton from '@/components/BookNowButton';

const Footer = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const quickLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/#testimonials', label: 'Testimonials' },
    { href: '/contact', label: 'Contact' },
  ];

  const services = [
    'Executive Leadership Coaching',
    'Team Development Programs', 
    'Leadership Workshops',
    'Organizational Culture Change'
  ];

  // Don't render on server to prevent hydration issues
  if (!isClient) {
    return null;
  }

  return (
    <footer className="bg-accent text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Four Column Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Section - Left Column */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <h3 className="text-xl font-bold mb-4">Nobilis Talent Solutions</h3>
            <p className="text-white/80 mb-6 leading-relaxed text-sm">
              Transforming leaders and organizations through proven coaching methodologies 
              and practical leadership development.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://www.linkedin.com/company/nobilis-talent-solutions/"
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-smooth"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="w-4 h-4" />
              </a>

              <a
                href="https://www.instagram.com/nobilis.talent"
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-smooth"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links - Second Column */}
          <div className="md:ml-10 xl:ml-20">
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-white/80 hover:text-primary transition-smooth text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services - Third Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <a
                    href="/services"
                    className="text-white/80 hover:text-primary transition-smooth text-sm block"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info - Right Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-primary" />
                <a
                  href="mailto:support@nobilistalent.com"
                  className="text-white/80 hover:text-primary transition-smooth text-sm"
                >
                  support@nobilistalent.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3 text-primary" />
                <a
                  href="tel:+16789561146"
                  className="text-white/80 hover:text-primary transition-smooth text-sm"
                >
                  (678) 956-1146
                </a>
              </div>
              <div className="mt-4">
                <BookNowButton
                  className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-light transition-smooth text-sm"
                  fallbackUrl={process.env.NEXT_PUBLIC_CALENDLY_URL}
                >
                  Book Consultation
                </BookNowButton>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-white/60 text-sm mb-4 md:mb-0">
              © 2025 Nobilis Talent Solutions. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a 
                href="/privacy-policy"
                className="text-white/60 hover:text-primary transition-smooth"
              >
                Privacy Policy
              </a>
              <a 
                href="/terms-of-service"
                className="text-white/60 hover:text-primary transition-smooth"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;