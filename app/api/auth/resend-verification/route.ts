import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/helpers/auth';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, getDoc, serverTimestamp, query, collection, where, getDocs, deleteDoc } from 'firebase/firestore';
import { EmailService } from '@/lib/services/EmailService';
import { logAuditAction } from '@/lib/utils/auditUtils';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check authentication
    const authResult = await getAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the email belongs to the authenticated user
    if (authResult.user.email !== email) {
      return NextResponse.json(
        { error: 'Email does not match authenticated user' },
        { status: 400 }
      );
    }

    // Check if user is already verified
    const userRef = doc(db, 'users', authResult.user.uid);
    const userSnapshot = await (async () => {
      try {
        return await getDoc(userRef);
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    })();

    if (userSnapshot?.exists() && userSnapshot.data()?.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Delete any existing verification tokens for this user
    const existingTokensQuery = query(
      collection(db, 'emailVerificationTokens'),
      where('userId', '==', authResult.user.uid)
    );
    const existingTokens = await getDocs(existingTokensQuery);
    
    const deletePromises = existingTokens.docs.map(docSnapshot => 
      deleteDoc(docSnapshot.ref)
    );
    await Promise.all(deletePromises);

    // Generate new verification token
    const verificationToken = randomBytes(32).toString('hex');

    // Store verification token in database
    const tokenRef = doc(db, 'emailVerificationTokens', verificationToken);
    await setDoc(tokenRef, {
      userId: authResult.user.uid,
      email: email,
      createdAt: serverTimestamp(),
      used: false
    });

    // Send verification email
    const emailService = EmailService.getInstance();
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}&mode=verify`;
    
    const emailResult = await emailService.sendEmail({
      to: email,
      subject: 'Verify Your Email Address - Payne Leadership',
      html: generateVerificationEmailHTML(email, verificationUrl),
    });

    if (!emailResult.success) {
      // Clean up token if email failed
      await deleteDoc(tokenRef);
      return NextResponse.json(
        { error: emailResult.error || 'Failed to send verification email' },
        { status: 500 }
      );
    }

    // Log audit action
    await logAuditAction({
      action: 'create',
      entity: 'auth',
      entityId: authResult.user.uid,
      timestamp: Date.now(),
      details: {
        title: 'Verification email sent',
        email: email,
        action: 'resend_verification'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}

function generateVerificationEmailHTML(email: string, verificationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Payne Leadership</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
            .highlight { background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Payne Leadership</h1>
                <p>Verify Your Email Address</p>
            </div>
            
            <div class="content">
                <h2>Welcome to Payne Leadership!</h2>
                
                <p>Thank you for creating an account with us. To complete your registration and secure your account, please verify your email address by clicking the button below.</p>
                
                <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                
                <div class="highlight">
                    <strong>Important:</strong> This verification link will expire in 24 hours for security reasons.
                </div>
                
                <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
                
                <p>Once your email is verified, you'll be able to:</p>
                <ul>
                    <li>Access all platform features</li>
                    <li>Receive important updates and notifications</li>
                    <li>Schedule consultations and access resources</li>
                    <li>Participate in leadership programs</li>
                </ul>
                
                <p>If you didn't create an account with Payne Leadership, please ignore this email.</p>
                
                <p>Need help? Reply to this email or contact our support team.</p>
            </div>
            
            <div class="footer">
                <p>Payne Leadership<br>
                123 Business St, City, State 12345<br>
                +1 (555) 123-4567 | support@payneleadership.com</p>
                
                <p style="font-size: 0.8em; margin-top: 20px;">
                    This email was sent to ${email}. If you did not request this verification, please ignore this email.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
}