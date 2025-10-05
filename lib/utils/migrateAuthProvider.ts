import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

/**
 * Migration utility to add authProvider field to existing users
 * This should be run once to update existing user profiles
 */
export async function migrateAuthProvider() {
  try {
    console.log('Starting authProvider migration...');
    
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const userDoc of querySnapshot.docs) {
      const userData = userDoc.data();
      
      // Skip if authProvider already exists
      if (userData.authProvider) {
        skippedCount++;
        continue;
      }
      
      // For existing users, we'll set a default provider
      // This allows them to continue using their current authentication method
      // They can update this later if needed
      const defaultProvider = 'email'; // Most users likely signed up with email
      
      await updateDoc(doc(db, 'users', userDoc.id), {
        authProvider: defaultProvider,
        updatedAt: new Date()
      });
      
      updatedCount++;
      console.log(`Updated user ${userDoc.id} with authProvider: ${defaultProvider}`);
    }
    
    console.log(`Migration completed: ${updatedCount} users updated, ${skippedCount} users skipped`);
    return { updatedCount, skippedCount };
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

/**
 * Update a specific user's authProvider
 * Use this for users who need to change their provider
 */
export async function updateUserAuthProvider(uid: string, provider: 'email' | 'google') {
  try {
    await updateDoc(doc(db, 'users', uid), {
      authProvider: provider,
      updatedAt: new Date()
    });
    
    console.log(`Updated user ${uid} authProvider to: ${provider}`);
    return true;
  } catch (error) {
    console.error('Failed to update user authProvider:', error);
    throw error;
  }
}
