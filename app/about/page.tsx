'use client'

import Navigation from '@/components/Navigation';
import AboutSection from '@/components/AboutSection';
import StickyCallButton from '@/components/StickyCallButton';
import ScrollToTop from '@/components/ScrollToTop';
import { useEffect } from 'react';

// Force dynamic rendering to prevent pre-rendering issues
export const dynamic = 'force-dynamic';

export default function AboutPage() {
  useEffect(() => {
    // Add page load animation
    document.body.classList.add('page-enter');
    
    // Smooth scroll behavior for all internal links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href')?.substring(1);
        const targetElement = document.getElementById(targetId || '');
        if (targetElement) {
          targetElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    return () => {
      // Cleanup
    };
  }, []);

  return (
    <div className="min-h-screen relative">
      <Navigation />
      <AboutSection />
      {/* Footer rendered globally in RootLayout */}
      <StickyCallButton />
      <ScrollToTop />
    </div>
  );
}
