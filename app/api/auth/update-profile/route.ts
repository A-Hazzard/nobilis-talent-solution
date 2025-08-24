import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/helpers/auth';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { logAuditAction } from '@/lib/utils/auditUtils';

export async function POST(request: NextRequest) {
  try {
    const updateData = await request.json();

    // Check authentication
    const authResult = await getAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email'];
    for (const field of requiredFields) {
      if (!updateData[field] || typeof updateData[field] !== 'string' || updateData[field].trim() === '') {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updateData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Update user document in Firestore
    const userRef = doc(db, 'users', authResult.user.uid);
    const updateFields: any = {
      firstName: updateData.firstName.trim(),
      lastName: updateData.lastName.trim(),
      email: updateData.email.trim().toLowerCase(),
      updatedAt: serverTimestamp(),
    };

    // Add optional fields if provided
    if (updateData.phone) {
      updateFields.phone = updateData.phone.trim();
    }
    if (updateData.organization) {
      updateFields.organization = updateData.organization.trim();
    }
    if (updateData.jobTitle) {
      updateFields.jobTitle = updateData.jobTitle.trim();
    }
    if (updateData.organizationType) {
      updateFields.organizationType = updateData.organizationType;
    }
    if (updateData.industryFocus) {
      updateFields.industryFocus = updateData.industryFocus;
    }
    if (updateData.teamSize) {
      updateFields.teamSize = updateData.teamSize;
    }
    if (updateData.primaryGoals) {
      updateFields.primaryGoals = updateData.primaryGoals;
    }
    if (updateData.challengesDescription) {
      updateFields.challengesDescription = updateData.challengesDescription.trim();
    }
    if (updateData.timeline) {
      updateFields.timeline = updateData.timeline;
    }
    if (updateData.budget) {
      updateFields.budget = updateData.budget;
    }

    await updateDoc(userRef, updateFields);

    // Log audit action
    await logAuditAction({
      action: 'update',
      entity: 'auth',
      entityId: authResult.user.uid,
      timestamp: Date.now(),
      details: {
        title: 'Profile updated',
        email: updateData.email,
        action: 'profile_update',
        updatedFields: Object.keys(updateFields).filter(key => key !== 'updatedAt')
      }
    });

    // Return updated user data
    const updatedUser = {
      id: authResult.user.uid,
      email: updateData.email.trim().toLowerCase(),
      firstName: updateData.firstName.trim(),
      lastName: updateData.lastName.trim(),
      phone: updateData.phone?.trim() || '',
      organization: updateData.organization?.trim() || '',
      jobTitle: updateData.jobTitle?.trim() || '',
      organizationType: updateData.organizationType || '',
      industryFocus: updateData.industryFocus || '',
      teamSize: updateData.teamSize || '',
      primaryGoals: updateData.primaryGoals || [],
      challengesDescription: updateData.challengesDescription?.trim() || '',
      timeline: updateData.timeline || '',
      budget: updateData.budget || '',
      role: authResult.user.role || 'user',
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isActive: true,
      emailVerified: false,
      onboardingCompleted: false,
    };

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
