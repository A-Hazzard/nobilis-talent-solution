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
    const userRecord = await adminAuth.createUser({
      email: leadData.email,
      password: leadData.password,
      displayName: `${leadData.firstName} ${leadData.lastName}`,
      emailVerified: false,
    });

    // Create user document in Firestore (users collection) with onboarding completed
    const now = new Date();
    const userDocData = {
      firstName: leadData.firstName,
      lastName: leadData.lastName,
      email: leadData.email,
      phone: leadData.phone,
      organization: leadData.organization,
      role: 'user', // All leads are regular users
      uid: userRecord.uid,
      displayName: `${leadData.firstName} ${leadData.lastName}`,
      isActive: true,
      // Set onboarding as completed for admin-created leads
      onboardingCompleted: true,
      onboardingCompletedAt: now,
      // Include other onboarding fields from form data
      jobTitle: leadData.jobTitle,
      organizationType: leadData.organizationType,
      industryFocus: leadData.industryFocus,
      teamSize: leadData.teamSize,
      primaryGoals: leadData.primaryGoals,
      challengesDescription: leadData.challengesDescription,
      timeline: leadData.timeline,
      budget: leadData.budget,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

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
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}


