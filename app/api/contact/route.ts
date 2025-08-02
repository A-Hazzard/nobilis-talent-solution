import { NextRequest, NextResponse } from 'next/server';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { EmailService } from '@/lib/services/EmailService';
import { AuditService } from '@/lib/services/AuditService';

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per window

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  challenges: string;
  contactMethod: 'email' | 'phone';
}

/**
 * Validate contact form data
 */
function validateContactForm(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!data.firstName?.trim()) errors.push('First name is required');
  if (!data.lastName?.trim()) errors.push('Last name is required');
  if (!data.email?.trim()) errors.push('Email is required');
  if (!data.challenges?.trim()) errors.push('Please describe your challenges');

  // Email validation
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Please enter a valid email address');
  }

  // Phone validation (if provided)
  if (data.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
    errors.push('Please enter a valid phone number');
  }

  // Length validations
  if (data.firstName && data.firstName.length < 2) errors.push('First name must be at least 2 characters');
  if (data.lastName && data.lastName.length < 2) errors.push('Last name must be at least 2 characters');
  if (data.challenges && data.challenges.length < 10) errors.push('Please provide more details about your challenges');
  if (data.challenges && data.challenges.length > 1000) errors.push('Challenge description is too long (max 1000 characters)');

  return {
    isValid: errors.length === 0,
    errors
  };
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
    
    // Check for suspicious content in challenges
    data.challenges.toLowerCase().includes('viagra'),
    data.challenges.toLowerCase().includes('casino'),
    data.challenges.toLowerCase().includes('loan'),
    data.challenges.toLowerCase().includes('make money fast'),
    
    // Check for suspicious names
    data.firstName.toLowerCase() === 'test',
    data.lastName.toLowerCase() === 'test',
    data.firstName.toLowerCase() === 'admin',
    data.lastName.toLowerCase() === 'admin',
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
    
    // Validate form data
    const validation = validateContactForm(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const formData: ContactFormData = {
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone?.trim(),
      company: body.company?.trim(),
      challenges: body.challenges.trim(),
      contactMethod: body.contactMethod || 'email'
    };

    // Spam detection
    if (detectSpam(formData)) {
      console.warn('Potential spam detected:', { ip, email: formData.email });
      // Still save the data but mark it as potential spam
      formData.challenges = '[POTENTIAL SPAM] ' + formData.challenges;
    }

    // Save to Firestore
    const contactData = {
      ...formData,
      createdAt: serverTimestamp(),
      ipAddress: ip,
      userAgent: request.headers.get('user-agent') || '',
      isSpam: detectSpam(formData),
      status: 'new'
    };

    const docRef = await addDoc(collection(db, 'contacts'), contactData);

    // Log audit action
    const auditService = AuditService.getInstance();
    await auditService.logAction({
      userId: 'anonymous',
      userEmail: formData.email,
      action: 'create',
      entity: 'contact',
      entityId: docRef.id,
      details: {
        title: `Contact form submission from ${formData.firstName} ${formData.lastName}`,
        company: formData.company,
        contactMethod: formData.contactMethod
      },
      timestamp: Date.now()
    });

    // Send email notifications
    const emailService = EmailService.getInstance();
    
    // Send confirmation email to user
    await emailService.sendContactConfirmation({
      to: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      company: formData.company || 'Not specified',
      challenges: formData.challenges,
      contactMethod: formData.contactMethod
    });

    // Send notification email to admin
    await emailService.sendContactNotification({
      to: process.env.ADMIN_EMAIL || 'kareempayne11@gmail.com',
      contactData: {
        ...formData,
        id: docRef.id,
        submittedAt: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.',
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