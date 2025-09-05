/**
 * Currency formatting utilities to ensure consistent USD display
 * across the application regardless of browser locale
 */

/**
 * Format amount as USD currency with consistent formatting
 * @param amount - Amount in dollars (e.g., 50.00)
 * @param options - Formatting options
 * @returns Formatted currency string (e.g., "USD 50.00")
 */
export function formatUSD(
  amount: number,
  options: {
    showCurrency?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const {
    showCurrency = true,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options;

  // Force USD locale to prevent browser locale interference
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits,
    maximumFractionDigits
  });

  const formatted = formatter.format(amount);
  
  // Return with or without currency symbol based on options
  return showCurrency ? formatted : formatted.replace('$', '');
}

/**
 * Format amount as USD without currency symbol
 * @param amount - Amount in dollars
 * @returns Formatted amount string (e.g., "50.00")
 */
export function formatUSDAmount(amount: number): string {
  return formatUSD(amount, { showCurrency: false });
}

/**
 * Format amount as USD with currency symbol
 * @param amount - Amount in dollars
 * @returns Formatted currency string (e.g., "$50.00")
 */
export function formatUSDCurrency(amount: number): string {
  return formatUSD(amount, { showCurrency: true });
}

/**
 * Parse currency string back to number
 * @param currencyString - Currency string (e.g., "$50.00", "USD 50.00")
 * @returns Parsed number or null if invalid
 */
export function parseUSDCurrency(currencyString: string): number | null {
  if (!currencyString) return null;
  
  // Remove currency symbols and text, keep only numbers and decimal point
  const cleaned = currencyString.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? null : parsed;
}

/**
 * Validate if a string represents a valid USD amount
 * @param amountString - String to validate
 * @returns True if valid USD amount
 */
export function isValidUSDAmount(amountString: string): boolean {
  const parsed = parseUSDCurrency(amountString);
  return parsed !== null && parsed >= 0;
}

/**
 * Get currency display options for different contexts
 */
export const CURRENCY_OPTIONS = {
  // For display in forms and inputs
  INPUT: {
    showCurrency: false,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  },
  // For display in tables and lists
  DISPLAY: {
    showCurrency: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  },
  // For compact display (e.g., tooltips)
  COMPACT: {
    showCurrency: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }
} as const;

