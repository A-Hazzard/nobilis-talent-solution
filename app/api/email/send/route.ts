import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/EmailService';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text } = await request.json();
    if (!to || !subject || (!html && !text)) {
      return NextResponse.json({ error: 'to, subject and html or text are required' }, { status: 400 });
    }

    const emailService = EmailService.getInstance();
    const result = await emailService.sendEmail({ to, subject, html: html || text, text });

    if (result.success) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: result.error || 'Failed to send' }, { status: 500 });
  } catch (error) {
    console.error('Email send API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



