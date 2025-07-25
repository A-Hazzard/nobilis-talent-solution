import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import type { FirebaseUser as AppUser, FirebaseAuthError } from '@/shared/types/firebase';
import { validateSignupForm, validateLoginForm } from '@/lib/utils/validation';

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  organization?: string;
  role: 'admin' | 'user';
  isActive: boolean;
  displayName: string;
  createdAt: Date;
  lastLoginAt?: Date;
  updatedAt: Date;
}

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signInWithEmail(email: string, password: string): Promise<{ user: AppUser | null; error: FirebaseAuthError | null }> {
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
      const user = this.mapFirebaseUser(userCredential.user);
      
      // Update last login time
      await this.updateLastLogin(userCredential.user.uid);
      
      return { user, error: null };
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
  ): Promise<{ user: AppUser | null; error: FirebaseAuthError | null }> {
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

      const user = this.mapFirebaseUser(userCredential.user);
      return { user, error: null };
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

  onAuthStateChanged(callback: (user: AppUser | null) => void): () => void {
    console.log('AuthService: Setting up onAuthStateChanged listener');
    return onAuthStateChanged(auth, (firebaseUser) => {
      console.log('AuthService: Firebase auth state changed:', firebaseUser);
      const user = firebaseUser ? this.mapFirebaseUser(firebaseUser) : null;
      console.log('AuthService: Mapped user for callback:', user);
      callback(user);
    });
  }

  getCurrentUser(): AppUser | null {
    const firebaseUser = auth.currentUser;
    return firebaseUser ? this.mapFirebaseUser(firebaseUser) : null;
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

  private mapFirebaseUser(firebaseUser: FirebaseUser): AppUser {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || undefined,
      emailVerified: firebaseUser.emailVerified,
      createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
      lastLoginAt: new Date(firebaseUser.metadata.lastSignInTime || Date.now()),
    };
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
        createdAt: new Date(),
        updatedAt: new Date(),
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
      await setDoc(doc(db, 'users', uid), {
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      }, { merge: true });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }
} 