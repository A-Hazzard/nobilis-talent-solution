import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/helpers/auth';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { EmailService } from '@/lib/services/EmailService';
import { logAuditAction } from '@/lib/utils/auditUtils';

type OnboardingData = {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  phone?: string;
  organizationName?: string;
  organizationType?: 'startup' | 'small-business' | 'enterprise' | 'nonprofit' | 'other';
  industryFocus?: string;
  teamSize?: string;
  primaryGoals?: string[];
  challengesDescription?: string;
  timeline?: string;
  budget?: string;
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await getAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const onboardingData: OnboardingData = await request.json();

    // Update user document with onboarding data
    const userRef = doc(db, 'users', authResult.user.uid);
    const updateData: any = {
      // Onboarding completion
      onboardingCompleted: true,
      onboardingCompletedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Only apply fields that were provided so we don't repeat registration info or overwrite blanks
    if (onboardingData.firstName) updateData.firstName = onboardingData.firstName;
    if (onboardingData.lastName) updateData.lastName = onboardingData.lastName;
    if (onboardingData.firstName || onboardingData.lastName) {
      updateData.displayName = `${onboardingData.firstName || ''} ${onboardingData.lastName || ''}`.trim();
    }
    if (onboardingData.jobTitle) updateData.jobTitle = onboardingData.jobTitle;
    if (onboardingData.phone) updateData.phone = onboardingData.phone;
    if (onboardingData.organizationName) updateData.organization = onboardingData.organizationName;
    if (onboardingData.organizationType) updateData.organizationType = onboardingData.organizationType;
    if (onboardingData.industryFocus) updateData.industryFocus = onboardingData.industryFocus;
    if (onboardingData.teamSize) updateData.teamSize = onboardingData.teamSize;
    if (onboardingData.primaryGoals && onboardingData.primaryGoals.length > 0) updateData.primaryGoals = onboardingData.primaryGoals;
    if (onboardingData.challengesDescription) updateData.challengesDescription = onboardingData.challengesDescription;
    if (onboardingData.timeline) updateData.timeline = onboardingData.timeline;
    if (onboardingData.budget) updateData.budget = onboardingData.budget;

    await updateDoc(userRef, updateData);

    // Send welcome email
    try {
      const emailService = EmailService.getInstance();
      await emailService.sendWelcomeEmail(
        authResult.user.email,
        `${onboardingData.firstName || ''} ${onboardingData.lastName || ''}`.trim()
      );
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the request if email fails
    }

    // Log audit action
    await logAuditAction({
      action: 'update',
      entity: 'auth',
      entityId: authResult.user.uid,
      timestamp: Date.now(),
      details: {
        title: 'Onboarding completed',
        organizationName: onboardingData.organizationName || null,
        primaryGoals: onboardingData.primaryGoals || [],
        hasCustomChallenges: !!onboardingData.challengesDescription,
        timeline: onboardingData.timeline || null,
        budget: onboardingData.budget || null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully'
    });

  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}