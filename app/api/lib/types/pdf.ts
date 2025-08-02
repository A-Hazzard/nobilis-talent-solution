/**
 * Backend PDF types for API routes
 */

export type PDFOptions = {
  format?: 'A4' | 'Letter';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}; 