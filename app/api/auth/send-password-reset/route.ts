import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { EmailService } from '@/lib/services/EmailService';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Generate Firebase password reset link
    const firebaseLink = await getAdminAuth().generatePasswordResetLink(email, {
      url: `${appUrl}/login`,
      handleCodeInApp: true,
    });

    // Build a custom link to our reset page using the oobCode from Firebase link
    // Firebase link looks like: https://<authDomain>/.../action?mode=resetPassword&oobCode=XXXX&continueUrl=...
    const url = new URL(firebaseLink);
    const oobCode = url.searchParams.get('oobCode');
    const lang = url.searchParams.get('lang') || undefined;
    const customResetLink = `${appUrl}/reset-password?oobCode=${encodeURIComponent(
      oobCode || ''
    )}${lang ? `&lang=${encodeURIComponent(lang)}` : ''}`;

    // Send using custom template
    const emailService = EmailService.getInstance();
    const result = await emailService.sendPasswordResetEmail(email, customResetLink);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('send-password-reset error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
