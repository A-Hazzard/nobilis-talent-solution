import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/helpers/auth';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRef = doc(db, 'users', authResult.user.uid);
    const userSnap = await getDoc(userRef);
    const data = userSnap.exists() ? userSnap.data() : null;
    const onboardingCompleted = data ? !!data.onboardingCompleted : false;
    const role = (data?.role as 'admin' | 'user') || 'user';

    return NextResponse.json({ onboardingCompleted, role });
  } catch (error) {
    console.error('check-onboarding error:', error);
    return NextResponse.json({ error: 'Failed to check onboarding' }, { status: 500 });
  }
}
