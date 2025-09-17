'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ExternalLink, Loader2 } from 'lucide-react';
import { useCalendlyBookingUrl } from '@/lib/hooks/useCalendlyBookingUrl';

export type BookNowButtonProps = {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  showIcon?: boolean;
  fallbackUrl?: string; // Fallback URL if no configuration is found
  onClick?: () => void; // Additional click handler
};

/**
 * Reusable Book Now button component that dynamically fetches the Calendly URL
 * from the database configuration. Falls back to environment variable if needed.
 */
export default function BookNowButton({
  variant = 'default',
  size = 'default',
  className = '',
  children = 'Book Now',
  disabled = false,
  showIcon = true,
  fallbackUrl,
  onClick,
}: BookNowButtonProps) {
  const [bookingState] = useCalendlyBookingUrl();

  /**
   * Handle button click
   */
  const handleClick = () => {
    // Call additional click handler first
    if (onClick) {
      onClick();
    }

    let url = bookingState.bookingUrl;
    
    // If no URL from database, try fallback
    if (!url && fallbackUrl) {
      url = fallbackUrl;
    }
    
    // If still no URL, try environment variable (client-side fallback)
    if (!url && typeof window !== 'undefined') {
      // This is a fallback for client-side rendering
      // The hook should handle server-side fallback
      console.warn('No Calendly booking URL available');
      return;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Determine if button should be disabled
  const isDisabled = disabled || 
    bookingState.isLoading || 
    (!bookingState.bookingUrl && !fallbackUrl) ||
    !bookingState.isActive;

  // Show loading state
  if (bookingState.isLoading) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled={true}
      >
        {showIcon && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Loading...
      </Button>
    );
  }

  // Show error state (but still allow fallback)
  if (bookingState.error && !fallbackUrl) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled={true}
        title={bookingState.error}
      >
        {showIcon && <CalendarIcon className="h-4 w-4 mr-2" />}
        Booking Unavailable
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={isDisabled}
      title={
        !bookingState.isActive 
          ? 'Calendly booking is currently disabled' 
          : bookingState.error 
            ? bookingState.error 
            : undefined
      }
    >
      {showIcon && <CalendarIcon className="h-4 w-4 mr-2" />}
      {children}
      {showIcon && (bookingState.bookingUrl || fallbackUrl) && (
        <ExternalLink className="h-3 w-3 ml-1" />
      )}
    </Button>
  );
}
