import { NextRequest, NextResponse } from 'next/server';
import { PDFService } from '@/lib/services/PDFService';
import { EmailService } from '@/lib/services/EmailService';
import type { InvoicePreview } from '@/shared/types/payment';

export async function POST(request: NextRequest) {
  try {
    const { invoice, invoiceNumber, sendEmail = false, emailAddress } = await request.json();

    if (!invoice || !invoiceNumber) {
      return NextResponse.json(
        { error: 'Invoice data and invoice number are required' },
        { status: 400 }
      );
    }

    const pdfService = PDFService.getInstance();
    const result = await pdfService.generateInvoicePDF(invoice, invoiceNumber);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to generate invoice PDF', details: result.error },
        { status: 500 }
      );
    }

    // If email is requested, send the invoice
    if (sendEmail && emailAddress) {
      const emailService = EmailService.getInstance();
      const emailResult = await emailService.sendInvoiceEmail({
        invoice,
        clientEmail: emailAddress,
        clientName: invoice.clientName,
      });

      if (!emailResult.success) {
        console.error('Failed to send invoice email:', emailResult.error);
        // Don't fail the request if email fails, just log it
      }
    }

    // Return the PDF data
    const filename = pdfService.getInvoiceFilename(invoiceNumber);
    
    return new NextResponse(result.data, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': result.data?.length.toString() || '0',
      },
    });
  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceNumber = searchParams.get('invoiceNumber');
    const format = searchParams.get('format') || 'pdf';

    if (!invoiceNumber) {
      return NextResponse.json(
        { error: 'Invoice number is required' },
        { status: 400 }
      );
    }

    // For demo purposes, create a sample invoice
    const sampleInvoice: InvoicePreview = {
      invoiceNumber: 'SAMPLE-001',
      clientName: 'Sample Client',
      clientEmail: 'client@example.com',
      items: [
        { 
          id: '1', 
          description: 'Leadership Consultation', 
          quantity: 1, 
          unitPrice: 200, 
          total: 200, 
          type: 'consultation' as const 
        },
        { 
          id: '2', 
          description: 'Strategy Planning Session', 
          quantity: 1, 
          unitPrice: 300, 
          total: 300, 
          type: 'service' as const 
        },
        { 
          id: '3', 
          description: 'Follow-up Meeting', 
          quantity: 1, 
          unitPrice: 150, 
          total: 150, 
          type: 'consultation' as const 
        },
      ],
      subtotal: 650,
      taxAmount: 0,
      total: 650,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    const pdfService = PDFService.getInstance();

    if (format === 'html') {
      // Return HTML version
      const html = await pdfService.generateInvoiceHTMLForEmail(sampleInvoice, invoiceNumber);
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    } else {
      // Return PDF version
      const result = await pdfService.generateInvoicePDF(sampleInvoice, invoiceNumber);
      
      if (!result.success) {
        return NextResponse.json(
          { error: 'Failed to generate invoice PDF', details: result.error },
          { status: 500 }
        );
      }

      const filename = pdfService.getInvoiceFilename(invoiceNumber);
      
      return new NextResponse(result.data, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': result.data?.length.toString() || '0',
        },
      });
    }
  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 