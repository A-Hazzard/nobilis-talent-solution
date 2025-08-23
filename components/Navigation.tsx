'use client';

import { useState, useEffect } from 'react';
import { Menu, X, LogOut, User, ChevronDown, Home, User as UserIcon, Settings, FileText, Phone } from 'lucide-react';
import { usePendingPayment } from '@/lib/hooks/usePendingPayment';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import logo  from "@/public/assets/logo-transparent.png"

import Link from 'next/link';
import Image from 'next/image';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();
  
  // Use authenticated user's email or fallback to demo email
  const userEmail = user?.email || 'john@company.com';
  const { hasPendingPayment, pendingPayment } = usePendingPayment(userEmail);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // Navigation links for home page (hash links for smooth scrolling)
  const homeNavLinks = [
    { href: '#home', label: 'Home', icon: Home },
    { href: '#about', label: 'About', icon: UserIcon },
    { href: '#services', label: 'Services', icon: Settings },
    { href: '/content', label: 'Content', icon: FileText },
    { href: '#contact', label: 'Contact', icon: Phone },
  ];

  // Navigation links for other pages (proper routing)
  const otherPageNavLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/#about', label: 'About', icon: UserIcon },
    { href: '/#services', label: 'Services', icon: Settings },
    { href: '/content', label: 'Content', icon: FileText },
    { href: '/#contact', label: 'Contact', icon: Phone },
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

  const [userDropdownOpen, setUserDropdownOpen] = useState(false); // for user profile dropdown

  // Scroll effect for sticky navigation
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownOpen && !(event.target as Element).closest('.user-dropdown')) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/98 backdrop-blur-lg border-b border-gray-200 shadow-lg'
            : 'bg-white/95 backdrop-blur-md border-b border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center lg:pl-6">
              <Link
                href="/"
                className="text-lg sm:text-xl md:text-2xl font-bold text-primary flex items-center"
              >
                <Image
                  src={logo}
                  alt="Nobilis Talent Solutions"
                  width={32}
                  height={32}
                  className="mr-2"
                />
                <span className="text-base sm:text-lg md:text-xl font-bold text-primary">
                  Nobilis Talent Solutions
                </span>
              </Link>
            </div>
  
            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <div className="flex items-baseline space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-700 hover:text-primary transition-smooth px-2 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium"
                    onClick={(e) => handleLinkClick(link.href, e)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
  
            {/* CTA Buttons - Desktop */}
            <div className="hidden lg:flex items-center space-x-2 lg:pr-6">
              {hasPendingPayment && (
                <a
                  href={`/payment/pending?email=${encodeURIComponent(userEmail)}`}
                  className="btn-secondary font-semibold whitespace-nowrap text-xs px-3 py-1.5"
                >
                  Pay ${pendingPayment?.baseAmount || '0'}
                </a>
              )}
  
              {isAuthenticated ? (
                <>
                  {/* User Profile Dropdown */}
                  <div className="relative group inline-block user-dropdown">
                    <button
                      className="flex items-center space-x-1 text-sm text-gray-700 hover:text-primary transition-smooth px-2 py-1.5 rounded-lg hover:bg-gray-50"
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    >
                      <User size={14} />
                      <span className="text-xs">{user?.firstName || user?.email}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white border border-gray-200 z-50">
                        <ul className="py-2">
                          <li>
                            <Link
                              href="/profile"
                              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary text-sm"
                              onClick={() => setUserDropdownOpen(false)}
                            >
                              Profile
                            </Link>
                          </li>
                          {user?.role === 'admin' && (
                            <li>
                              <Link
                                href="/admin"
                                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary text-sm"
                                onClick={() => setUserDropdownOpen(false)}
                              >
                                Admin Dashboard
                              </Link>
                            </li>
                          )}
                          <li>
                            <hr className="my-1 border-gray-200" />
                          </li>
                          <li>
                            <button
                              onClick={() => {
                                signOut();
                                setUserDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary text-sm flex items-center space-x-2"
                            >
                              <LogOut size={14} />
                              <span>Logout</span>
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/signup" className="btn-outline text-xs px-3 py-1.5">
                    Sign Up
                  </Link>
                </>
              )}
  
              <button
                onClick={() => window.open(process.env.NEXT_PUBLIC_CALENDLY_URL, '_blank')}
                className="btn-primary text-xs px-3 py-1.5"
              >
                Book Now
              </button>
            </div>
  
            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:text-primary transition-smooth p-2 touch-manipulation active:scale-95 hover:bg-gray-50 rounded-lg"
                aria-label="Open navigation menu"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;