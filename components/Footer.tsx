'use client';

import { Mail, Phone, Linkedin, Instagram } from 'lucide-react';
import { useEffect, useState } from 'react';

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
        {/* Brand Section */}
        <div className="mb-12 text-center">
          <h3 className="text-2xl font-bold mb-4">Nobilis Talent Solutions</h3>
          <p className="text-white/80 mb-6 leading-relaxed max-w-2xl mx-auto">
            Transforming leaders and organizations through proven coaching methodologies 
            and practical leadership development.
          </p>
          <div className="flex space-x-4 justify-center">
            <a
              href="https://www.linkedin.com/company/108357874/admin/dashboard/"
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-smooth"
              aria-label="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="w-5 h-5" />
            </a>

            <a
              href="https://www.instagram.com/nobilis.talent"
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-smooth"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Three Column Grid for Links, Services, Contact */}
        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-white/80 hover:text-primary transition-smooth font-bold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <span className="text-white/80 text-sm">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-primary" />
                <a
                  href="mailto:nobilis.talent@gmail.com"
                  className="text-white/80 hover:text-primary transition-smooth"
                >
                  nobilis.talent@gmail.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-primary" />
                <a
                  href="tel:+15551234567"
                  className="text-white/80 hover:text-primary transition-smooth"
                >
                  (678) 920-6605
                </a>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => window.open(process.env.NEXT_PUBLIC_CALENDLY_URL, '_blank')}
                  className="bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary-light transition-smooth inline-block"
                >
                  Book Consultation
                </button>
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
              <a href="#" className="text-white/60 hover:text-primary transition-smooth">
                Privacy Policy
              </a>
              <a href="#" className="text-white/60 hover:text-primary transition-smooth">
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