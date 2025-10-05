'use client'

import Navigation from '@/components/Navigation';
import ServicesPage from '@/components/services/ServicesPage';
import StickyCallButton from '@/components/StickyCallButton';
import ScrollToTop from '@/components/ScrollToTop';
import { useScrollAnimations, useParallax } from '@/lib/hooks/useScrollAnimations';
import { useEffect } from 'react';

// Force dynamic rendering to prevent pre-rendering issues
export const dynamic = 'force-dynamic';

export default function ServicesPageRoute() {
  useScrollAnimations();
  useParallax();

  useEffect(() => {
    // Add page load animation
    document.body.classList.add('page-enter');
    
    // Handle anchor links for smooth scrolling to specific services
    const handleAnchorScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const targetElement = document.querySelector(hash);
        if (targetElement) {
          setTimeout(() => {
            targetElement.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }, 500); // Small delay to ensure page is loaded
        }
      }
    };

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

    // Handle initial anchor scroll
    handleAnchorScroll();

    return () => {
      // Cleanup
    };
  }, []);

  return (
    <div className="min-h-screen relative">
      <Navigation />
      <ServicesPage />
      {/* Footer rendered globally in RootLayout */}
      <StickyCallButton />
      <ScrollToTop />
    </div>
  );
}
