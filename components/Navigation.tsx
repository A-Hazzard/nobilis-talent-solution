'use client';

import { useState } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import { usePendingPayment } from '@/lib/hooks/usePendingPayment';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';



const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();
  
  // Use authenticated user's email or fallback to demo email
  const userEmail = user?.email || 'john@company.com';
  const { hasPendingPayment, pendingPayment, isLoading: paymentLoading } = usePendingPayment(userEmail);
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
               Nobilis Talent Solutions
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
                 {/* Show user info and logout for authenticated users */}
                 <div className="flex items-center space-x-2 text-sm text-foreground">
                   <User size={16} />
                   <span>{user?.firstName || user?.email}</span>
                 </div>
                 {user?.role === 'admin' && (
                   <Link
                     href="/admin"
                     className="text-foreground hover:text-primary transition-smooth px-3 py-2 rounded-lg hover:bg-muted"
                   >
                     Admin
                   </Link>
                 )}
                 <button
                   onClick={signOut}
                   className="text-foreground hover:text-primary transition-smooth px-3 py-2 rounded-lg hover:bg-muted flex items-center space-x-1"
                 >
                   <LogOut size={16} />
                   <span>Logout</span>
                 </button>
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
                    {/* Show user info and logout for authenticated users */}
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
                    {/* Show only signup for unauthenticated users */}
                    <Link
                      href="/signup"
                      className="btn-outline w-full text-center block"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
                
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