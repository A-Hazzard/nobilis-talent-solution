import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/helpers/auth';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { EmailService } from '@/lib/services/EmailService';
import { logAuditAction } from '@/lib/utils/auditUtils';

type OnboardingData = {
  firstName: string;
  lastName: string;
  jobTitle: string;
  phone: string;
  organizationName: string;
  organizationType: 'startup' | 'small-business' | 'enterprise' | 'nonprofit' | 'other';
  industryFocus: string;
  teamSize: string;
  primaryGoals: string[];
  challengesDescription: string;
  timeline: string;
  budget: string;
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await getAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const onboardingData: OnboardingData = await request.json();

    // Validate required fields
    if (!onboardingData.firstName || !onboardingData.lastName || !onboardingData.organizationName) {
      return NextResponse.json(
        { error: 'First name, last name, and organization name are required' },
        { status: 400 }
      );
    }

    if (!onboardingData.primaryGoals || onboardingData.primaryGoals.length === 0) {
      return NextResponse.json(
        { error: 'At least one primary goal must be selected' },
        { status: 400 }
      );
    }

    // Update user document with onboarding data
    const userRef = doc(db, 'users', authResult.user.uid);
    const updateData = {
      // Basic profile info
      firstName: onboardingData.firstName,
      lastName: onboardingData.lastName,
      displayName: `${onboardingData.firstName} ${onboardingData.lastName}`,
      jobTitle: onboardingData.jobTitle || '',
      phone: onboardingData.phone || '',
      
      // Organization info
      organization: onboardingData.organizationName,
      organizationType: onboardingData.organizationType,
      industryFocus: onboardingData.industryFocus || '',
      teamSize: onboardingData.teamSize || '',
      
      // Goals and preferences
      primaryGoals: onboardingData.primaryGoals,
      challengesDescription: onboardingData.challengesDescription || '',
      timeline: onboardingData.timeline || '',
      budget: onboardingData.budget || '',
      
      // Onboarding completion
      onboardingCompleted: true,
      onboardingCompletedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await updateDoc(userRef, updateData);

    // Send welcome email
    try {
      const emailService = EmailService.getInstance();
      await emailService.sendWelcomeEmail(
        authResult.user.email,
        `${onboardingData.firstName} ${onboardingData.lastName}`
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
        organizationName: onboardingData.organizationName,
        primaryGoals: onboardingData.primaryGoals,
        hasCustomChallenges: !!onboardingData.challengesDescription,
        timeline: onboardingData.timeline,
        budget: onboardingData.budget
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