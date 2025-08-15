'use client';

import { useState, useEffect } from 'react';
import { Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import { usePendingPayment } from '@/lib/hooks/usePendingPayment';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

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
    { href: '/services', label: 'Services' },
    { href: '/content', label: 'Content' },
    { href: '#contact', label: 'Contact' },
  ];

  // Navigation links for other pages (proper routing)
  const otherPageNavLinks = [
    { href: '/', label: 'Home' },
    { href: '/#about', label: 'About' },
    { href: '/services', label: 'Services' },
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

  const [servicesOpen, setServicesOpen] = useState(false); // for mobile
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false); // for desktop services dropdown
  const [userDropdownOpen, setUserDropdownOpen] = useState(false); // for user profile dropdown

  // Service links for dropdown
  const serviceDropdownLinks = [
    { id: 'executive-coaching', title: 'Executive Coaching' },
    { id: 'team-development', title: 'Team Development' },
    { id: 'leadership-workshops', title: 'Leadership Workshops' },
  ];

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
      if (servicesDropdownOpen && !(event.target as Element).closest('.services-dropdown')) {
        setServicesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen, servicesDropdownOpen]);

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
               {navLinks.map((link) => {
                                 if (link.label === 'Services') {
                  return (
                    <div 
                      key="services-dropdown" 
                      className="relative inline-block services-dropdown"
                      onMouseEnter={() => setServicesDropdownOpen(true)}
                      onMouseLeave={() => setServicesDropdownOpen(false)}
                    >
                      <button
                        className="text-foreground hover:text-primary transition-smooth px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium flex items-center gap-1"
                        onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                      >
                        Services
                        <ChevronDown className={`w-4 h-4 transition-transform ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {/* Dropdown menu */}
                      {servicesDropdownOpen && (
                        <div className="absolute left-0 top-full w-56 rounded-lg shadow-lg bg-white border border-gray-200 z-50">
                          <ul className="py-2">
                            <li>
                              <Link
                                href="/services"
                                className="block px-4 py-2 text-gray-700 hover:bg-muted hover:text-primary text-sm font-semibold border-b border-gray-100"
                                onClick={() => setServicesDropdownOpen(false)}
                              >
                                All Services
                              </Link>
                            </li>
                            {serviceDropdownLinks.map((service) => (
                              <li key={service.id}>
                                <Link
                                  href={`/services/${service.id}`}
                                  className="block px-4 py-2 text-gray-700 hover:bg-muted hover:text-primary text-sm"
                                  onClick={() => setServicesDropdownOpen(false)}
                                >
                                  {service.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                }
                 // Render other links as usual
                 return (
                   <Link
                     key={link.href}
                     href={link.href}
                     className="text-foreground hover:text-primary transition-smooth px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium"
                     onClick={(e) => handleLinkClick(link.href, e)}
                   >
                     {link.label}
                   </Link>
                 );
               })}
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
                          <hr className="my-1 border-gray-200" />
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              signOut();
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-muted hover:text-primary text-sm flex items-center space-x-2"
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

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary transition-smooth p-2 touch-manipulation active:scale-95 hover:bg-muted rounded-lg"
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isOpen}
            >
              <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 pt-4 pb-6 space-y-2 bg-background border-t border-card-border shadow-lg">
            <div className={`transform transition-all duration-300 ease-in-out ${
              isOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
            }`}>
              {navLinks.map((link) => {
                if (link.label === 'Services') {
                  return (
                    <div key="services-mobile-dropdown" className="">
                      <button
                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-foreground hover:text-primary hover:bg-muted transition-smooth font-medium focus:outline-none"
                        onClick={() => setServicesOpen(!servicesOpen)}
                        aria-expanded={servicesOpen}
                        aria-controls="mobile-services-dropdown"
                      >
                        <span>Services</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <div className={`overflow-hidden transition-all duration-200 ease-in-out ${
                        servicesOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <div id="mobile-services-dropdown" className="pl-4">
                          <ul className="py-1">
                            {serviceDropdownLinks.map((service) => (
                              <li key={service.id}>
                                <Link
                                  href={`/services/${service.id}`}
                                  className="block px-2 py-2 text-gray-700 hover:bg-muted hover:text-primary text-sm"
                                  onClick={() => setIsOpen(false)}
                                >
                                  {service.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-foreground hover:text-primary block px-4 py-3 rounded-lg hover:bg-muted transition-smooth font-medium touch-manipulation active:scale-98 active:bg-muted min-h-12 flex items-center"
                    onClick={(e) => handleLinkClick(link.href, e)}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="pt-6 space-y-4 border-t border-gray-200">
                {hasPendingPayment && (
                  <a
                    href={`/payment/pending?email=${encodeURIComponent(userEmail)}`}
                    className="btn-secondary w-full text-center block font-semibold"
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
                        className="text-foreground hover:text-primary block px-3 py-2 rounded-lg hover:bg-muted transition-smooth"
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
                      className="text-foreground hover:text-primary block px-3 py-2 rounded-lg hover:bg-muted transition-smooth w-full text-left flex items-center space-x-2"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signup"
                      className="btn-outline w-full text-center block touch-manipulation active:scale-98 min-h-12 flex items-center justify-center"
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
                  className="btn-primary w-full text-center block touch-manipulation active:scale-98 min-h-12 flex items-center justify-center"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;