'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#services', label: 'Services' },
    { href: '#testimonials', label: 'Testimonials' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-card-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="#home" className="text-2xl font-bold text-primary">
              Kareem Payne
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-foreground hover:text-primary transition-smooth px-3 py-2 rounded-lg hover:bg-muted"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* CTA Button - Desktop */}
          <div className="hidden md:block">
            <a
              href="#contact"
              className="btn-primary"
            >
              Book a Call
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary transition-smooth p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-t border-card-border">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-foreground hover:text-primary block px-3 py-2 rounded-lg hover:bg-muted transition-smooth"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4">
                <a
                  href="#contact"
                  className="btn-primary w-full text-center block"
                  onClick={() => setIsOpen(false)}
                >
                  Book a Call
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;