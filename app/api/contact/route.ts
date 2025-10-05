import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { EmailService } from '@/lib/services/EmailService';
import { AuditService } from '@/lib/services/AuditService';

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per window

type ContactFormData = {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  message: string;
  budget?: string;
  timeline?: string;
  serviceType?: string;
};

/**
 * Filter out undefined values from an object
 * Firebase doesn't allow undefined values in documents
 */
function filterUndefinedValues(obj: Record<string, any>): Record<string, any> {
  const filtered: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      filtered[key] = value;
    }
  }
  return filtered;
}

/**
 * Check rate limiting
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetTime: now + RATE_LIMIT_WINDOW };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  // Increment count
  record.count++;
  rateLimitMap.set(ip, record);
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count, resetTime: record.resetTime };
}

/**
 * Simple spam detection
 */
function detectSpam(data: ContactFormData): boolean {
  const spamIndicators = [
    // Check for suspicious patterns in email
    data.email.includes('test@'),
    data.email.includes('example@'),
    data.email.includes('spam@'),
    
    // Check for suspicious content in message
    data.message.toLowerCase().includes('viagra'),
    data.message.toLowerCase().includes('casino'),
    data.message.toLowerCase().includes('loan'),
    data.message.toLowerCase().includes('make money fast'),
    
    // Check for suspicious names
    data.name.toLowerCase() === 'test',
    data.name.toLowerCase() === 'admin',
  ];

  return spamIndicators.some(indicator => indicator);
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limiting
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          resetTime: rateLimit.resetTime 
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Basic validation
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, and message are required' },
        { status: 400 }
      );
    }

    const formData: ContactFormData = {
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone?.trim() || null,
      organization: body.organization?.trim() || null,
      message: body.message.trim(),
      budget: body.budget?.trim() || null,
      timeline: body.timeline?.trim() || null,
      serviceType: body.serviceType?.trim() || null
    };

    // Spam detection
    if (detectSpam(formData)) {
      console.warn('Potential spam detected:', { ip, email: formData.email });
      // Still save the data but mark it as potential spam
      formData.message = '[POTENTIAL SPAM] ' + formData.message;
    }

    // Save to Firestore using Admin SDK
    const adminDb = getAdminFirestore();
    const contactData = filterUndefinedValues({
      ...formData,
      createdAt: new Date(),
      ipAddress: ip,
      userAgent: request.headers.get('user-agent') || '',
      isSpam: detectSpam(formData),
      status: 'new'
    });

    const docRef = await adminDb.collection('contacts').add(contactData);

    // Log audit action
    const auditService = AuditService.getInstance();
    await auditService.logAction({
      userId: 'anonymous',
      userEmail: formData.email,
      action: 'create',
      entity: 'contact',
      entityId: docRef.id,
      details: {
        title: `Contact form submission from ${formData.name}`,
        organization: formData.organization,
        message: formData.message.substring(0, 100) + '...'
      },
      timestamp: Date.now()
    });

    // Send email notifications
    const emailService = EmailService.getInstance();
    
    // Send confirmation email to user
    await emailService.sendContactConfirmation({
      to: formData.email,
      firstName: formData.name.split(' ')[0] || formData.name,
      lastName: formData.name.split(' ').slice(1).join(' ') || '',
      company: formData.organization || 'Not specified',
      challenges: formData.message,
      contactMethod: 'email'
    });

    // Send notification email to admin
    await emailService.sendContactNotification({
      to: process.env.ADMIN_EMAIL || process.env.SMTP_FROM || 'kareem@nobilistalent.com',
      contactData: {
        id: docRef.id,
        firstName: formData.name.split(' ')[0] || formData.name,
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
        email: formData.email,
        phone: formData.phone,
        company: formData.organization,
        challenges: formData.message,
        contactMethod: 'email' as const,
        submittedAt: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for contacting Nobilis Talent Solutions! We\'ll get back to you within 24 hours.',
      contactId: docRef.id
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}