'use client';

import { useState, useEffect } from 'react';
import { Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import { usePendingPayment } from '@/lib/hooks/usePendingPayment';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

import Link from 'next/link';

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

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-background/98 backdrop-blur-lg border-b border-card-border shadow-lg' 
        : 'bg-background/95 backdrop-blur-md border-b border-card-border'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-primary">
              Nobilis Talent Solutions
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="ml-8 flex items-baseline space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-foreground hover:text-primary transition-smooth px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium"
                  onClick={(e) => handleLinkClick(link.href, e)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Buttons - Desktop */}
          <div className="hidden lg:flex items-center space-x-3">
            {hasPendingPayment && (
              <a
                href={`/payment/pending?email=${encodeURIComponent(userEmail)}`}
                className="btn-secondary font-semibold whitespace-nowrap"
              >
                Pay ${pendingPayment?.baseAmount || '0'}
              </a>
            )}
            
            {isAuthenticated ? (
              <>
                {/* User Profile Dropdown */}
                <div className="relative group inline-block user-dropdown">
                  <button
                    className="flex items-center space-x-2 text-sm text-foreground hover:text-primary transition-smooth px-3 py-2 rounded-lg hover:bg-muted"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  >
                    <User size={16} />
                    <span>{user?.firstName || user?.email}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {/* User Dropdown menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white border border-gray-200 z-50">
                      <ul className="py-2">
                        <li>
                          <Link
                            href="/profile"
                            className="block px-4 py-2 text-gray-700 hover:bg-muted hover:text-primary text-sm"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            Profile
                          </Link>
                        </li>
                        {user?.role === 'admin' && (
                          <li>
                            <Link
                              href="/admin"
                              className="block px-4 py-2 text-gray-700 hover:bg-muted hover:text-primary text-sm"
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
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-muted hover:text-primary text-sm flex items-center space-x-2"
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
                {/* Show only signup for unauthenticated users */}
                <Link
                  href="/signup"
                  className="btn-outline"
                >
                  Sign Up
                </Link>
              </>
            )}
            
            <button
              onClick={() => window.open(process.env.NEXT_PUBLIC_CALENDLY_URL, '_blank')}
              className="btn-primary text-sm px-4 py-2"
            >
              Book Now
            </button>
          </div>

          {/* Mobile menu button - Shadcn Sheet */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:text-primary transition-smooth p-2 touch-manipulation active:scale-95 hover:bg-muted rounded-lg"
                  aria-label="Open navigation menu"
                >
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-lg font-semibold">Menu</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8"
                    >
                      <X size={20} />
                    </Button>
                  </div>

                  {/* Navigation Links */}
                  <div className="flex-1 p-6 space-y-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block text-foreground hover:text-primary px-4 py-3 rounded-lg hover:bg-muted transition-smooth font-medium touch-manipulation active:scale-98 active:bg-muted min-h-12 flex items-center"
                        onClick={(e) => handleLinkClick(link.href, e)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  {/* CTA Buttons */}
                  <div className="p-6 space-y-4 border-t border-border">
                    {hasPendingPayment && (
                      <a
                        href={`/payment/pending?email=${encodeURIComponent(userEmail)}`}
                        className="btn-secondary w-full text-center font-semibold"
                        onClick={() => setIsOpen(false)}
                      >
                        Pay ${pendingPayment?.baseAmount || '0'}
                      </a>
                    )}
                    
                    {isAuthenticated ? (
                      <>
                        <div className="flex items-center space-x-2 text-sm text-foreground px-3 py-2">
                          <User size={16} />
                          <span>{user?.firstName || user?.email}</span>
                        </div>
                        {user?.role === 'admin' && (
                          <Link
                            href="/admin"
                            className="text-foreground hover:text-primary px-3 py-2 rounded-lg hover:bg-muted transition-smooth block"
                            onClick={() => setIsOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            signOut();
                            setIsOpen(false);
                          }}
                          className="text-foreground hover:text-primary px-3 py-2 rounded-lg hover:bg-muted transition-smooth w-full text-left flex items-center space-x-2"
                        >
                          <LogOut size={16} />
                          <span>Logout</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/signup"
                          className="btn-outline w-full text-center touch-manipulation active:scale-98 min-h-12 flex items-center justify-center"
                          onClick={() => setIsOpen(false)}
                        >
                          Sign Up
                        </Link>
                      </>
                    )}
                    
                    <button
                      onClick={() => {
                        window.open(process.env.NEXT_PUBLIC_CALENDLY_URL, '_blank');
                        setIsOpen(false);
                      }}
                      className="btn-primary w-full text-center touch-manipulation active:scale-98 min-h-12 flex items-center justify-center"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;