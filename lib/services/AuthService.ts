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
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
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

      // Check if user exists and validate authentication provider
      const userProfile = await this.getUserProfileByEmail(email);
      if (userProfile && userProfile.authProvider && userProfile.authProvider !== 'email') {
        const providerName = userProfile.authProvider === 'google' ? 'Google' : 'social login';
        return {
          user: null,
          error: {
            code: 'auth/wrong-provider',
            message: `This account was created using ${providerName}. Please sign in with ${providerName} instead.`
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
      
      // Provide comprehensive user-friendly error messages
      let userMessage = 'Failed to sign in. Please try again.';
      let errorDetails = '';
      
      switch (error.code) {
        case 'auth/user-not-found':
          userMessage = 'No account found with this email address.';
          errorDetails = 'The email address you entered is not registered. Please check your email or create a new account.';
          break;
        case 'auth/wrong-password':
          userMessage = 'Incorrect password. Please try again.';
          errorDetails = 'The password you entered is incorrect. Please check your password and try again.';
          break;
        case 'auth/invalid-email':
          userMessage = 'Please enter a valid email address.';
          errorDetails = 'The email format is invalid. Please enter a valid email address (e.g., user@example.com).';
          break;
        case 'auth/too-many-requests':
          userMessage = 'Too many failed attempts. Please try again later.';
          errorDetails = 'For security reasons, your account has been temporarily locked due to multiple failed login attempts. Please wait a few minutes before trying again.';
          break;
        case 'auth/user-disabled':
          userMessage = 'This account has been disabled. Please contact support.';
          errorDetails = 'Your account has been deactivated. Please contact our support team for assistance.';
          break;
        case 'auth/operation-not-allowed':
          userMessage = 'Email/password sign-in is not enabled. Please contact support.';
          errorDetails = 'Email and password authentication is currently disabled. Please contact our support team or try signing in with Google.';
          break;
        case 'auth/network-request-failed':
          userMessage = 'Network error. Please check your connection and try again.';
          errorDetails = 'Unable to connect to our servers. Please check your internet connection and try again.';
          break;
        case 'auth/invalid-credential':
          userMessage = 'Invalid login credentials. Please check your email and password.';
          errorDetails = 'The email or password you entered is incorrect. Please verify your credentials and try again.';
          break;
        case 'auth/account-exists-with-different-credential':
          userMessage = 'Account exists with different sign-in method.';
          errorDetails = 'An account with this email already exists, but it was created using a different sign-in method (like Google). Please use that method to sign in.';
          break;
        case 'auth/wrong-provider':
          userMessage = 'Wrong sign-in method for this account.';
          errorDetails = 'This account was created using a different sign-in method. Please use the correct method to sign in.';
          break;
        case 'auth/requires-recent-login':
          userMessage = 'Please sign in again to continue.';
          errorDetails = 'For security reasons, you need to sign in again to perform this action.';
          break;
        case 'auth/weak-password':
          userMessage = 'Password is too weak. Please choose a stronger password.';
          errorDetails = 'Your password must be at least 8 characters long and contain a mix of letters, numbers, and special characters.';
          break;
        case 'auth/email-already-in-use':
          userMessage = 'Email address is already in use.';
          errorDetails = 'An account with this email address already exists. Please sign in with your existing account or use a different email address.';
          break;
        default:
          userMessage = 'An unexpected error occurred. Please try again.';
          errorDetails = `Error code: ${error.code}. If this problem persists, please contact our support team.`;
      }
      
      // Log detailed error for debugging
      console.error('Authentication error details:', {
        code: error.code,
        message: error.message,
        userMessage,
        errorDetails
      });
      
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
        authProvider: 'email',
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

  async getUserProfileByEmail(email: string): Promise<UserProfile | null> {
    try {
      // Query users collection by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile by email:', error);
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

      // Check if user exists and validate authentication provider
      let userProfile = await this.getUserProfile(firebaseUser.uid);
      const isNewUser = !userProfile; // Determine if this is a new user
      
      if (!userProfile) {
        // Check if an account with this email already exists using a different provider
        const existingProfile = await this.getUserProfileByEmail(firebaseUser.email || '');
        if (existingProfile && existingProfile.authProvider === 'email') {
          return {
            user: null,
            error: {
              code: 'auth/account-exists-with-different-credential',
              message: 'An account with this email already exists using email/password. Please sign in with your password instead.'
            }
          };
        }
        
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
          authProvider: 'google',
        });
        
        userProfile = await this.getUserProfile(firebaseUser.uid);
      } else {
        // For existing users, validate they're using the correct provider
        if (userProfile.authProvider !== 'google') {
          const providerName = userProfile.authProvider === 'email' ? 'email/password' : 'social login';
          return {
            user: null,
            error: {
              code: 'auth/wrong-provider',
              message: `This account was created using ${providerName}. Please sign in with ${providerName} instead.`
            }
          };
        }
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
      
      // Provide comprehensive user-friendly error messages for Google sign-in
      let userMessage = 'Failed to sign in with Google. Please try again.';
      let errorDetails = '';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          userMessage = 'Sign-in was cancelled.';
          errorDetails = 'You closed the Google sign-in popup. Please try again to complete the sign-in process.';
          break;
        case 'auth/popup-blocked':
          userMessage = 'Sign-in popup was blocked.';
          errorDetails = 'Your browser blocked the Google sign-in popup. Please allow popups for this site and try again.';
          break;
        case 'auth/cancelled-popup-request':
          userMessage = 'Sign-in was cancelled.';
          errorDetails = 'The sign-in process was cancelled. Please try again.';
          break;
        case 'auth/account-exists-with-different-credential':
          userMessage = 'Account exists with different sign-in method.';
          errorDetails = 'An account with this email already exists, but it was created using email/password. Please sign in with your password instead.';
          break;
        case 'auth/wrong-provider':
          userMessage = 'Wrong sign-in method for this account.';
          errorDetails = 'This account was created using email/password. Please sign in with your email and password instead.';
          break;
        case 'auth/network-request-failed':
          userMessage = 'Network error. Please check your connection and try again.';
          errorDetails = 'Unable to connect to Google servers. Please check your internet connection and try again.';
          break;
        case 'auth/operation-not-allowed':
          userMessage = 'Google sign-in is not enabled. Please contact support.';
          errorDetails = 'Google sign-in is currently disabled. Please contact our support team or try signing in with email and password.';
          break;
        case 'auth/too-many-requests':
          userMessage = 'Too many failed attempts. Please try again later.';
          errorDetails = 'For security reasons, Google sign-in has been temporarily disabled due to multiple failed attempts. Please wait a few minutes before trying again.';
          break;
        case 'auth/user-disabled':
          userMessage = 'This Google account has been disabled.';
          errorDetails = 'Your Google account has been deactivated. Please contact Google support or try signing in with a different account.';
          break;
        case 'auth/invalid-credential':
          userMessage = 'Invalid Google credentials.';
          errorDetails = 'The Google sign-in credentials are invalid. Please try signing in again or use a different Google account.';
          break;
        case 'auth/requires-recent-login':
          userMessage = 'Please sign in to Google again to continue.';
          errorDetails = 'For security reasons, you need to sign in to Google again to perform this action.';
          break;
        default:
          userMessage = 'An unexpected error occurred during Google sign-in. Please try again.';
          errorDetails = `Error code: ${error.code || 'unknown'}. If this problem persists, please contact our support team.`;
      }
      
      // Log detailed error for debugging
      console.error('Google sign-in error details:', {
        code: error.code,
        message: error.message,
        userMessage,
        errorDetails
      });
      
      return { 
        user: null, 
        error: { 
          code: error.code || 'auth/unknown-error',
          message: userMessage
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
    authProvider: 'email' | 'google';
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
        authProvider: userData.authProvider,
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
