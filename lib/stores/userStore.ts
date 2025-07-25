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
  signOut: () => Promise<{ error: FirebaseAuthError | null }>;
  initializeAuth: () => () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => {
      const authService = AuthService.getInstance();

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
                  phone: userProfile?.phone,
                  organization: userProfile?.organization,
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
              };
              
              set({ 
                user: mappedUser, 
                firebaseUser: user, 
                isAuthenticated: true, 
                isLoading: false 
              });
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
        
        signOut: async () => {
          set({ isLoading: true });
          
          try {
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
          const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
              // Handle async user profile fetching properly
              const fetchUserProfile = async () => {
                try {
                  const userProfile = await authService.getUserProfile(firebaseUser.uid);
                  
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
                  
                  set({ 
                    user: mappedUser, 
                    firebaseUser, 
                    isAuthenticated: true, 
                    isLoading: false 
                  });
                } catch (error) {
                  console.error('Error fetching user profile:', error);
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
              set({
                user: null,
                firebaseUser: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          });
          
          // Return unsubscribe function for cleanup
          return unsubscribe;
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