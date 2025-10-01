import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/helpers/auth';
import { getAdminAuth } from '@/lib/firebase/admin';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { logAdminAction } from '@/lib/helpers/auditLogger';
import { validateSignupForm } from '@/lib/utils/validation';
import type { Lead } from '@/shared/types/entities';

type CreateLeadData = Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> & { 
  password: string; 
  confirmPassword: string; 
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication - only admins can create leads
    const authResult = await getAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const leadData: CreateLeadData = await request.json();

    // Validate the lead data (including password validation)
    if (!leadData.password || !leadData.confirmPassword) {
      return NextResponse.json({ error: 'Password and confirmation are required' }, { status: 400 });
    }

    const validation = validateSignupForm({
      email: leadData.email,
      password: leadData.password,
      confirmPassword: leadData.confirmPassword,
      firstName: leadData.firstName,
      lastName: leadData.lastName,
      organization: leadData.organization || ''
    });

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors).find(error => error);
      return NextResponse.json({ error: firstError || 'Invalid input data' }, { status: 400 });
    }

    // Create user using Firebase Admin SDK (no auto-login)
    const adminAuth = getAdminAuth();
    let userRecord;
    
    try {
      userRecord = await adminAuth.createUser({
        email: leadData.email,
        password: leadData.password,
        displayName: `${leadData.firstName} ${leadData.lastName}`,
        emailVerified: false,
      });
    } catch (authError: any) {
      // Handle Firebase Auth errors with clean messages
      if (authError.code === 'auth/email-already-exists') {
        return NextResponse.json({ 
          error: 'This email address is already registered. Please use a different email.' 
        }, { status: 400 });
      } else if (authError.code === 'auth/invalid-email') {
        return NextResponse.json({ 
          error: 'Invalid email address format.' 
        }, { status: 400 });
      } else if (authError.code === 'auth/weak-password') {
        return NextResponse.json({ 
          error: 'Password is too weak. Please use a stronger password.' 
        }, { status: 400 });
      }
      
      // Generic auth error
      console.error('Firebase Auth error:', authError.code, authError.message);
      return NextResponse.json({ 
        error: 'Failed to create user account. Please try again.' 
      }, { status: 500 });
    }

    // Create user document in Firestore (users collection) with onboarding completed
    const userDocData: any = {
      firstName: leadData.firstName,
      lastName: leadData.lastName,
      email: leadData.email,
      phone: leadData.phone || '',
      organization: leadData.organization || '',
      role: 'user', // All leads are regular users
      uid: userRecord.uid,
      displayName: `${leadData.firstName} ${leadData.lastName}`,
      isActive: true,
      // Set onboarding as completed for admin-created leads
      onboardingCompleted: true,
      onboardingCompletedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Only include onboarding fields if they have values (Firestore doesn't accept undefined)
    if (leadData.jobTitle) userDocData.jobTitle = leadData.jobTitle;
    if (leadData.organizationType) userDocData.organizationType = leadData.organizationType;
    if (leadData.industryFocus) userDocData.industryFocus = leadData.industryFocus;
    if (leadData.teamSize) userDocData.teamSize = leadData.teamSize;
    if (leadData.primaryGoals && leadData.primaryGoals.length > 0) userDocData.primaryGoals = leadData.primaryGoals;
    if (leadData.challengesDescription) userDocData.challengesDescription = leadData.challengesDescription;
    if (leadData.timeline) userDocData.timeline = leadData.timeline;
    if (leadData.budget) userDocData.budget = leadData.budget;

    try {
      const docRef = await addDoc(collection(db, 'users'), userDocData);
      
      // Audit log
      await logAdminAction({
        userId: authResult.user.uid,
        userEmail: authResult.user.email,
        action: 'create',
        entity: 'lead',
        entityId: docRef.id,
        details: { 
          firstName: leadData.firstName, 
          lastName: leadData.lastName,
          leadEmail: leadData.email,
          onboardingCompleted: true 
        },
      });
      
      return NextResponse.json({ id: docRef.id });
    } catch (firestoreError: any) {
      console.error('Firestore error:', firestoreError.message);
      
      // Clean up Firebase Auth user if Firestore fails
      try {
        await adminAuth.deleteUser(userRecord.uid);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
      
      return NextResponse.json({ 
        error: 'Failed to save user data. Please try again.' 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Unexpected error creating lead:', error.message || error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred. Please try again.' 
    }, { status: 500 });
  }
}


