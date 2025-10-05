import { NextRequest, NextResponse } from 'next/server';

/**
 * DEPRECATED: PDF generation is now frontend-only using jsPDF + html2canvas
 * This endpoint is no longer used. PDFs are generated on the frontend and sent to /api/invoice/send-email
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated. PDF generation is now frontend-only.',
      message: 'Please generate PDFs on the frontend using generateInvoicePdf() helper'
    },
    { status: 410 } // 410 Gone
  );
}

export async function GET(_request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated. PDF generation is now frontend-only.',
      message: 'Please generate PDFs on the frontend using generateInvoicePdf() helper'
    },
    { status: 410 } // 410 Gone
  );
}
