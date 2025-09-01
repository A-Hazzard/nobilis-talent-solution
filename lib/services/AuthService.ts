import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import type { FirebaseAuthError } from '@/shared/types/firebase';
import type { User as AppUser } from '@/shared/types/entities';
import type { UserProfile } from '@/lib/types/services';
import { validateSignupForm, validateLoginForm } from '@/lib/utils/validation';
import { logAdminLogin } from '@/lib/utils/auditUtils';

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signInWithEmail(email: string, password: string): Promise<{ user: FirebaseUser | null; error: FirebaseAuthError | null }> {
    try {
      // Validate inputs
      const validation = validateLoginForm(email, password);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors).find(error => error);
        return { 
          user: null, 
          error: { 
            code: 'validation-error', 
            message: firstError || 'Invalid input data' 
          } 
        };
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login time
      await this.updateLastLogin(userCredential.user.uid);
      
      // Log admin login for audit
      if (userCredential.user.uid === 'wG2jJtLiFCOaRF6jZ2DMo8u8yAh1') {
        await logAdminLogin();
      }
      
      return { user: userCredential.user, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Provide user-friendly error messages
      let userMessage = 'Failed to sign in. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          userMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          userMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          userMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          userMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/user-disabled':
          userMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/operation-not-allowed':
          userMessage = 'Email/password sign-in is not enabled. Please contact support.';
          break;
        case 'auth/network-request-failed':
          userMessage = 'Network error. Please check your connection and try again.';
          break;
      }
      
      return { user: null, error: { code: error.code, message: userMessage } };
    }
  }

  async signUpWithEmail(
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string,
    organization: string,
    phone: string
  ): Promise<{ user: FirebaseUser | null; error: FirebaseAuthError | null }> {
    try {
      // Validate inputs
      const validation = validateSignupForm({
        email,
        password,
        confirmPassword: password, // We'll handle confirmation separately
        firstName,
        lastName,
        organization
      });
      
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors).find(error => error);
        return { 
          user: null, 
          error: { 
            code: 'validation-error', 
            message: firstError || 'Invalid input data' 
          } 
        };
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`,
      });

      // Store additional user data in Firestore
      await this.createUserProfile(userCredential.user.uid, {
        firstName,
        lastName,
        email,
        organization: organization || 'Not specified',
        phone: phone || '',
        displayName: `${firstName} ${lastName}`,
      });

      return { user: userCredential.user, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Provide user-friendly error messages
      let userMessage = 'Failed to create account. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          userMessage = 'An account with this email already exists. Please sign in instead.';
          break;
        case 'auth/invalid-email':
          userMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          userMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/operation-not-allowed':
          userMessage = 'Email/password sign-up is not enabled. Please contact support.';
          break;
        case 'auth/network-request-failed':
          userMessage = 'Network error. Please check your connection and try again.';
          break;
        case 'auth/too-many-requests':
          userMessage = 'Too many failed attempts. Please try again later.';
          break;
      }
      
      return { user: null, error: { code: error.code, message: userMessage } };
    }
  }

  async signOut(): Promise<{ error: FirebaseAuthError | null }> {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error: { code: error.code, message: error.message } };
    }
  }

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    console.log('AuthService: Setting up onAuthStateChanged listener');
    return onAuthStateChanged(auth, (firebaseUser) => {
      console.log('AuthService: Firebase auth state changed:', firebaseUser);
      callback(firebaseUser);
    });
  }

  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async signInWithGoogle(): Promise<{ user: FirebaseUser | null; error: FirebaseAuthError | null; isNewUser?: boolean }> {
    try {
      console.log('AuthService: Starting Google sign-in...');
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      if (!firebaseUser) {
        return { 
          user: null, 
          error: { code: 'auth/user-not-found', message: 'No user returned from Google sign-in' } 
        };
      }

      // Get or create user profile
      let userProfile = await this.getUserProfile(firebaseUser.uid);
      const isNewUser = !userProfile; // Determine if this is a new user
      
      if (!userProfile) {
        // Create profile for new social user
        const names = firebaseUser.displayName?.split(' ') || ['', ''];
        const firstName = names[0] || '';
        const lastName = names.slice(1).join(' ') || '';
        
        await this.createUserProfile(firebaseUser.uid, {
          firstName,
          lastName,
          email: firebaseUser.email || '',
          organization: '',
          phone: '',
          displayName: firebaseUser.displayName || `${firstName} ${lastName}`.trim(),
        });
        
        userProfile = await this.getUserProfile(firebaseUser.uid);
      } else {
        // For existing users, ensure onboardingCompleted is set to true if not already set
        if (userProfile.onboardingCompleted === undefined) {
          await this.updateUserProfile(firebaseUser.uid, {
            onboardingCompleted: true,
            onboardingCompletedAt: new Date()
          });
          // Refresh the profile to get updated data
          userProfile = await this.getUserProfile(firebaseUser.uid);
        }
      }
      
      // Update last login
      await this.updateLastLogin(firebaseUser.uid);
      
      // Log admin login if applicable
      if (userProfile?.role === 'admin') {
        await logAdminLogin(firebaseUser.uid, firebaseUser.email || '');
      }
      
      console.log('AuthService: Google sign-in successful');
      return { user: firebaseUser, error: null, isNewUser };
      
    } catch (error: any) {
      console.error('AuthService: Google sign-in error:', error);
      return { 
        user: null, 
        error: { 
          code: error.code || 'auth/unknown-error',
          message: error.message || 'Failed to sign in with Google'
        }
      };
    }
  }



  private mapFirebaseUser(firebaseUser: FirebaseUser): AppUser {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      firstName: firebaseUser.displayName?.split(' ')[0] || '',
      lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
      role: firebaseUser.uid === 'wG2jJtLiFCOaRF6jZ2DMo8u8yAh1' ? 'admin' : 'user',
      createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
      lastLoginAt: new Date(firebaseUser.metadata.lastSignInTime || Date.now()),
      isActive: true,
    };
  }

  async getAppUser(uid: string): Promise<AppUser | null> {
    try {
      const userProfile = await this.getUserProfile(uid);
      if (!userProfile) return null;

      return {
        id: uid,
        email: userProfile.email,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        displayName: userProfile.displayName,
        phone: userProfile.phone,
        organization: userProfile.organization,
        role: userProfile.role,
        createdAt: userProfile.createdAt,
        memberSince: userProfile.memberSince,
        lastLoginAt: userProfile.lastLoginAt,
        isActive: userProfile.isActive,
      };
    } catch (error) {
      console.error('Error getting app user:', error);
      return null;
    }
  }

  private async createUserProfile(uid: string, userData: {
    firstName: string;
    lastName: string;
    email: string;
    organization: string;
    phone: string;
    displayName: string;
  }): Promise<void> {
    try {
      const now = new Date();
      const userProfile = {
        uid,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        organization: userData.organization,
        phone: userData.phone,
        displayName: userData.displayName,
        role: 'user',
        isActive: true,
        onboardingCompleted: false,
        createdAt: now,
        memberSince: now, // Set memberSince to current date and time
        lastLoginAt: now, // Set initial last login to creation time
        updatedAt: now,
      };

      await setDoc(doc(db, 'users', uid), userProfile);
      console.log('User profile created successfully for:', uid);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  private async updateLastLogin(uid: string): Promise<void> {
    try {
      const now = new Date();
      await setDoc(doc(db, 'users', uid), {
        lastLoginAt: now,
        updatedAt: now,
      }, { merge: true });
      console.log('Last login updated for user:', uid);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }
} 
