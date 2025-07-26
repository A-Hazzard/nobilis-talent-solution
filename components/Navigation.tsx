'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // Navigation links for home page (hash links for smooth scrolling)
  const homeNavLinks = [
    { href: '#home', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#services', label: 'Services' },
    { href: '/content', label: 'Content' },
    { href: '#contact', label: 'Contact' },
  ];

  // Navigation links for other pages (proper routing)
  const otherPageNavLinks = [
    { href: '/', label: 'Home' },
    { href: '/#about', label: 'About' },
    { href: '/#services', label: 'Services' },
    { href: '/content', label: 'Content' },
    { href: '/#contact', label: 'Contact' },
  ];

  const navLinks = isHomePage ? homeNavLinks : otherPageNavLinks;

  // Handle hash link clicks on home page
  const handleLinkClick = (href: string, e: React.MouseEvent) => {
    if (isHomePage && href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
    // Close mobile menu
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-card-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-primary">
              Kareem Payne
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-foreground hover:text-primary transition-smooth px-3 py-2 rounded-lg hover:bg-muted"
                  onClick={(e) => handleLinkClick(link.href, e)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Buttons - Desktop */}
          <div className="hidden md:block flex items-center space-x-4">
            <a
              href="/payment"
              className="btn-secondary"
            >
              Pay
            </a>
            <a
              href="#contact"
              className="btn-primary"
              onClick={(e) => handleLinkClick(isHomePage ? "#contact" : "/#contact", e)}
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
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-foreground hover:text-primary block px-3 py-2 rounded-lg hover:bg-muted transition-smooth"
                  onClick={(e) => handleLinkClick(link.href, e)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 space-y-3">
                <a
                  href="/payment"
                  className="btn-secondary w-full text-center block"
                  onClick={() => setIsOpen(false)}
                >
                  Pay
                </a>
                <a
                  href="#contact"
                  className="btn-primary w-full text-center block"
                  onClick={(e) => handleLinkClick(isHomePage ? "#contact" : "/#contact", e)}
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