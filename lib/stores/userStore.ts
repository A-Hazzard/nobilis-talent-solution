import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/shared/types/entities';
import type { FirebaseUser, FirebaseAuthError } from '@/shared/types/firebase';
import { AuthService } from '@/lib/services/AuthService';

interface UserState {
  // User data
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<{ error: FirebaseAuthError | null }>;
  signUp: (email: string, password: string, firstName: string, lastName: string, organization: string, phone: string) => Promise<{ error: FirebaseAuthError | null }>;
  signInWithGoogle: () => Promise<{ error: FirebaseAuthError | null; isNewUser?: boolean }>;
  signOut: () => Promise<{ error: FirebaseAuthError | null }>;
  initializeAuth: () => () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => {
      return {
        // Initial state
        user: null,
        firebaseUser: null,
        isLoading: true,
        isAuthenticated: false,
        
        // State setters
        setUser: (user: User | null) => {
          set({ 
            user, 
            isAuthenticated: !!user 
          });
        },
        
        setFirebaseUser: (firebaseUser: FirebaseUser | null) => {
          set({ firebaseUser });
        },
        
        setLoading: (isLoading: boolean) => {
          set({ isLoading });
        },
        
        clearUser: () => {
          set({
            user: null,
            firebaseUser: null,
            isAuthenticated: false,
            isLoading: false,
          });
        },
        
        // Auth actions
        signIn: async (email: string, password: string) => {
          set({ isLoading: true });
          
          try {
            const authService = AuthService.getInstance();
            const { user, error } = await authService.signInWithEmail(email, password);
            
            if (error) {
              set({ isLoading: false });
              return { error };
            }
            
            if (user) {
              // Fetch user profile from Firestore to get real data
              try {
                const userProfile = await authService.getUserProfile(user.uid);
                
                // Map Firebase user to our User type with real data
                const mappedUser: User = {
                  id: user.uid,
                  email: user.email,
                  firstName: userProfile?.firstName || user.displayName?.split(' ')[0] || '',
                  lastName: userProfile?.lastName || user.displayName?.split(' ').slice(1).join(' ') || '',
                  displayName: userProfile?.displayName,
                  phone: userProfile?.phone,
                  organization: userProfile?.organization,
                  role: userProfile?.role || (user.uid === 'wG2jJtLiFCOaRF6jZ2DMo8u8yAh1' ? 'admin' : 'user'),
                  createdAt: userProfile?.createdAt || user.createdAt,
                  lastLoginAt: userProfile?.lastLoginAt || user.lastLoginAt,
                  isActive: userProfile?.isActive ?? true,
                  
                  // Email verification
                  emailVerified: userProfile?.emailVerified || false,
                  emailVerifiedAt: userProfile?.emailVerifiedAt,
                  
                  // Onboarding fields
                  onboardingCompleted: userProfile?.onboardingCompleted || false,
                  onboardingCompletedAt: userProfile?.onboardingCompletedAt,
                  jobTitle: userProfile?.jobTitle,
                  organizationType: userProfile?.organizationType,
                  industryFocus: userProfile?.industryFocus,
                  teamSize: userProfile?.teamSize,
                  primaryGoals: userProfile?.primaryGoals,
                  challengesDescription: userProfile?.challengesDescription,
                  timeline: userProfile?.timeline,
                  budget: userProfile?.budget,
                };
                
                set({ 
                  user: mappedUser, 
                  firebaseUser: user, 
                  isAuthenticated: true, 
                  isLoading: false 
                });
              } catch (profileError) {
                console.error('Error fetching user profile during sign in:', profileError);
                // Fallback to Firebase Auth data only
                const mappedUser: User = {
                  id: user.uid,
                  email: user.email,
                  firstName: user.displayName?.split(' ')[0] || '',
                  lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
                  role: user.uid === 'wG2jJtLiFCOaRF6jZ2DMo8u8yAh1' ? 'admin' : 'user',
                  createdAt: user.createdAt,
                  lastLoginAt: user.lastLoginAt,
                  isActive: true,
                  emailVerified: false, // Default to false for new users
                  onboardingCompleted: false, // Default to false for new users
                };
                
                set({ 
                  user: mappedUser, 
                  firebaseUser: user, 
                  isAuthenticated: true, 
                  isLoading: false 
                });
              }
            }
            
            return { error: null };
          } catch {
            set({ isLoading: false });
            return { 
              error: { 
                code: 'unknown-error', 
                message: 'An unexpected error occurred' 
              } 
            };
          }
        },
        
        signUp: async (email: string, password: string, firstName: string, lastName: string, organization: string, phone: string) => {
          set({ isLoading: true });
          
          try {
            const authService = AuthService.getInstance();
            const { user, error } = await authService.signUpWithEmail(email, password, firstName, lastName, organization, phone);
            
            if (error) {
              set({ isLoading: false });
              return { error };
            }
            
            if (user) {
              // Fetch user profile from Firestore to get real data
              const userProfile = await authService.getUserProfile(user.uid);
              
              // Map Firebase user to our User type with real data
              const mappedUser: User = {
                id: user.uid,
                email: user.email,
                firstName,
                lastName,
                phone,
                organization,
                role: userProfile?.role || (user.uid === 'wG2jJtLiFCOaRF6jZ2DMo8u8yAh1' ? 'admin' : 'user'),
                createdAt: userProfile?.createdAt || user.createdAt,
                lastLoginAt: userProfile?.lastLoginAt || user.lastLoginAt,
                isActive: userProfile?.isActive ?? true,
                emailVerified: false, // New users need email verification
                onboardingCompleted: false, // New users need onboarding
              };
              
              set({ 
                user: mappedUser, 
                firebaseUser: user, 
                isAuthenticated: true, 
                isLoading: false 
              });
              
              // Send verification email for new users
              try {
                await fetch('/api/auth/send-verification', {
                  method: 'POST',
                  credentials: 'include',
                });
              } catch (emailError) {
                console.error('Failed to send verification email:', emailError);
                // Don't fail signup if email fails
              }
            }
            
            return { error: null };
          } catch {
            set({ isLoading: false });
            return { 
              error: { 
                code: 'unknown-error', 
                message: 'An unexpected error occurred' 
              } 
            };
          }
        },

        signInWithGoogle: async () => {
          set({ isLoading: true });
          
          try {
            const authService = AuthService.getInstance();
            const { user, error, isNewUser } = await authService.signInWithGoogle();
            
            if (error) {
              set({ isLoading: false });
              return { error, isNewUser };
            }
            
            if (user) {
              // Fetch user profile from Firestore to get real data
              const userProfile = await authService.getUserProfile(user.uid);
              
              // Parse names from display name
              const names = user.displayName?.split(' ') || ['', ''];
              const firstName = names[0] || '';
              const lastName = names.slice(1).join(' ') || '';
              
              // Map Firebase user to our User type with real data
              const mappedUser: User = {
                id: user.uid,
                email: user.email,
                firstName: userProfile?.firstName || firstName,
                lastName: userProfile?.lastName || lastName,
                phone: userProfile?.phone || '',
                organization: userProfile?.organization || '',
                role: userProfile?.role || (user.uid === 'wG2jJtLiFCOaRF6jZ2DMo8u8yAh1' ? 'admin' : 'user'),
                createdAt: userProfile?.createdAt || user.createdAt,
                lastLoginAt: userProfile?.lastLoginAt || user.lastLoginAt,
                isActive: userProfile?.isActive ?? true,
              };
              
              set({ 
                user: mappedUser, 
                firebaseUser: user, 
                isAuthenticated: true, 
                isLoading: false 
              });
            }
            
            return { error: null, isNewUser };
          } catch {
            set({ isLoading: false });
            return { 
              error: { 
                code: 'unknown-error', 
                message: 'An unexpected error occurred' 
              },
              isNewUser: false
            };
          }
        },


        
        signOut: async () => {
          set({ isLoading: true });
          
          try {
            const authService = AuthService.getInstance();
            const { error } = await authService.signOut();
            
            if (error) {
              set({ isLoading: false });
              return { error };
            }
            
            set({
              user: null,
              firebaseUser: null,
              isAuthenticated: false,
              isLoading: false,
            });
            
            return { error: null };
          } catch {
            set({ isLoading: false });
            return { 
              error: { 
                code: 'unknown-error', 
                message: 'An unexpected error occurred' 
              } 
            };
          }
        },
        
        initializeAuth: () => {
          console.log('UserStore: initializeAuth called');
          
          // Add a timeout to prevent infinite loading
          const timeoutId = setTimeout(() => {
            console.log('UserStore: Auth initialization timeout, setting loading to false');
            set({
              user: null,
              firebaseUser: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }, 5000); // 5 second timeout
          
          const authService = AuthService.getInstance();
          const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
            console.log('UserStore: onAuthStateChanged called with user:', firebaseUser);
            clearTimeout(timeoutId); // Clear timeout when auth state changes
            
            if (firebaseUser) {
              console.log('UserStore: User found, fetching profile...');
              // Handle async user profile fetching properly
              const fetchUserProfile = async () => {
                try {
                  const userProfile = await authService.getUserProfile(firebaseUser.uid);
                  console.log('UserStore: User profile fetched:', userProfile);
                  
                  // Map Firebase user to our User type with real data
                  const mappedUser: User = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email,
                    firstName: userProfile?.firstName || firebaseUser.displayName?.split(' ')[0] || '',
                    lastName: userProfile?.lastName || firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
                    phone: userProfile?.phone,
                    organization: userProfile?.organization,
                    role: userProfile?.role || (firebaseUser.uid === 'wG2jJtLiFCOaRF6jZ2DMo8u8yAh1' ? 'admin' : 'user'),
                    createdAt: userProfile?.createdAt || firebaseUser.createdAt,
                    lastLoginAt: userProfile?.lastLoginAt || firebaseUser.lastLoginAt,
                    isActive: userProfile?.isActive ?? true,
                  };
                  
                  console.log('UserStore: Setting authenticated user state');
                  set({ 
                    user: mappedUser, 
                    firebaseUser, 
                    isAuthenticated: true, 
                    isLoading: false 
                  });
                } catch (error) {
                  console.error('UserStore: Error fetching user profile:', error);
                  // Fallback to Firebase Auth data only
                  const mappedUser: User = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email,
                    firstName: firebaseUser.displayName?.split(' ')[0] || '',
                    lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
                    role: firebaseUser.uid === 'wG2jJtLiFCOaRF6jZ2DMo8u8yAh1' ? 'admin' : 'user',
                    createdAt: firebaseUser.createdAt,
                    lastLoginAt: firebaseUser.lastLoginAt,
                    isActive: true,
                  };
                  
                  console.log('UserStore: Setting fallback user state');
                  set({ 
                    user: mappedUser, 
                    firebaseUser, 
                    isAuthenticated: true, 
                    isLoading: false 
                  });
                }
              };
              
              fetchUserProfile();
            } else {
              console.log('UserStore: No user found, setting unauthenticated state');
              set({
                user: null,
                firebaseUser: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          });
          
          // Return unsubscribe function for cleanup
          return () => {
            clearTimeout(timeoutId);
            unsubscribe();
          };
        },
      };
    },
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        firebaseUser: state.firebaseUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 