import { AuthService } from '@/lib/services/AuthService';
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
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { validateSignupForm, validateLoginForm } from '@/lib/utils/validation';
import { logAdminLogin } from '@/lib/utils/auditUtils';

// Mock Firebase modules
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  updateProfile: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({
    addScope: jest.fn(),
  })),
}));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
}));
jest.mock('@/lib/firebase/config', () => ({
  auth: {},
  db: {},
}));
jest.mock('@/lib/utils/validation');
jest.mock('@/lib/utils/auditUtils');

const mockSignInWithEmailAndPassword = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>;
const mockCreateUserWithEmailAndPassword = createUserWithEmailAndPassword as jest.MockedFunction<typeof createUserWithEmailAndPassword>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>;
const mockUpdateProfile = updateProfile as jest.MockedFunction<typeof updateProfile>;
const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<typeof signInWithPopup>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockValidateSignupForm = validateSignupForm as jest.MockedFunction<typeof validateSignupForm>;
const mockValidateLoginForm = validateLoginForm as jest.MockedFunction<typeof validateLoginForm>;
const mockLogAdminLogin = logAdminLogin as jest.MockedFunction<typeof logAdminLogin>;

describe('AuthService', () => {
  let authService: AuthService;
  const mockUser: FirebaseUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: true,
  } as FirebaseUser;

  beforeEach(() => {
    authService = AuthService.getInstance();
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = AuthService.getInstance();
      const instance2 = AuthService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('signInWithEmail', () => {
    it('should sign in successfully with valid credentials', async () => {
      mockValidateLoginForm.mockReturnValue({ isValid: true, errors: {} });
      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      } as any);
      mockDoc.mockReturnValue('doc-ref' as any);
      mockSetDoc.mockResolvedValue(undefined);

      const result = await authService.signInWithEmail('test@example.com', 'password123');

      expect(result.user).toBe(mockUser);
      expect(result.error).toBeNull();
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith({}, 'test@example.com', 'password123');
    });

    it('should handle validation errors', async () => {
      mockValidateLoginForm.mockReturnValue({
        isValid: false,
        errors: { email: 'Invalid email format' },
      });

      const result = await authService.signInWithEmail('invalid-email', 'password');

      expect(result.user).toBeNull();
      expect(result.error?.code).toBe('validation-error');
      expect(result.error?.message).toBe('Invalid email format');
    });

    it('should handle user-not-found error', async () => {
      mockValidateLoginForm.mockReturnValue({ isValid: true, errors: {} });
      const authError = new Error('User not found');
      (authError as any).code = 'auth/user-not-found';
      mockSignInWithEmailAndPassword.mockRejectedValue(authError);

      const result = await authService.signInWithEmail('test@example.com', 'password');

      expect(result.user).toBeNull();
      expect(result.error?.code).toBe('auth/user-not-found');
      expect(result.error?.message).toBe('No account found with this email address.');
    });

    it('should handle wrong-password error', async () => {
      mockValidateLoginForm.mockReturnValue({ isValid: true, errors: {} });
      const authError = new Error('Wrong password');
      (authError as any).code = 'auth/wrong-password';
      mockSignInWithEmailAndPassword.mockRejectedValue(authError);

      const result = await authService.signInWithEmail('test@example.com', 'wrongpassword');

      expect(result.user).toBeNull();
      expect(result.error?.code).toBe('auth/wrong-password');
      expect(result.error?.message).toBe('Incorrect password. Please try again.');
    });

    it('should log admin login for admin user', async () => {
      const adminUser = { ...mockUser, uid: 'wG2jJtLiFCOaRF6jZ2DMo8u8yAh1' };
      mockValidateLoginForm.mockReturnValue({ isValid: true, errors: {} });
      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: adminUser,
      } as any);
      mockDoc.mockReturnValue('doc-ref' as any);
      mockSetDoc.mockResolvedValue(undefined);

      await authService.signInWithEmail('admin@example.com', 'password123');

      expect(mockLogAdminLogin).toHaveBeenCalled();
    });
  });

  describe('signUpWithEmail', () => {
    it('should sign up successfully with valid data', async () => {
      mockValidateSignupForm.mockReturnValue({ isValid: true, errors: {} });
      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      } as any);
      mockUpdateProfile.mockResolvedValue(undefined);
      mockDoc.mockReturnValue('doc-ref' as any);
      mockSetDoc.mockResolvedValue(undefined);

      const result = await authService.signUpWithEmail(
        'test@example.com',
        'password123',
        'John',
        'Doe',
        'Test Org',
        '1234567890'
      );

      expect(result.user).toBe(mockUser);
      expect(result.error).toBeNull();
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalled();
      expect(mockUpdateProfile).toHaveBeenCalled();
      expect(mockSetDoc).toHaveBeenCalled();
    });

    it('should handle validation errors during signup', async () => {
      mockValidateSignupForm.mockReturnValue({
        isValid: false,
        errors: { email: 'Email is required' },
      });

      const result = await authService.signUpWithEmail(
        '',
        'password123',
        'John',
        'Doe',
        'Test Org',
        '1234567890'
      );

      expect(result.user).toBeNull();
      expect(result.error?.code).toBe('validation-error');
      expect(result.error?.message).toBe('Email is required');
    });

    it('should handle email-already-in-use error', async () => {
      mockValidateSignupForm.mockReturnValue({ isValid: true, errors: {} });
      const authError = new Error('Email already in use');
      (authError as any).code = 'auth/email-already-in-use';
      mockCreateUserWithEmailAndPassword.mockRejectedValue(authError);

      const result = await authService.signUpWithEmail(
        'existing@example.com',
        'password123',
        'John',
        'Doe',
        'Test Org',
        '1234567890'
      );

      expect(result.user).toBeNull();
      expect(result.error?.code).toBe('auth/email-already-in-use');
      expect(result.error?.message).toBe('An account with this email already exists. Please sign in instead.');
    });
  });

  describe('signInWithGoogle', () => {
    it('should handle popup errors', async () => {
      const authError = new Error('Popup error');
      (authError as any).code = 'auth/popup-error';
      mockSignInWithPopup.mockRejectedValue(authError);

      const result = await authService.signInWithGoogle();

      expect(result.user).toBeNull();
      expect(result.error).toBeTruthy();
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      mockSignOut.mockResolvedValue(undefined);

      const result = await authService.signOut();

      expect(result.error).toBeNull();
      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should handle sign out error', async () => {
      mockSignOut.mockRejectedValue(new Error('Sign out failed'));

      const result = await authService.signOut();

      expect(result.error).toEqual({ code: undefined, message: 'Sign out failed' });
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', () => {
      const mockAuth = { currentUser: mockUser };
      jest.mocked(require('@/lib/firebase/config')).auth = mockAuth;

      const user = authService.getCurrentUser();

      expect(user).toBe(mockUser);
    });
  });



  // Note: updateUserProfile, completeOnboarding, updateLastLogin are private methods

  describe('onAuthStateChanged', () => {
    it('should set up auth state listener', () => {
      const mockCallback = jest.fn();
      mockOnAuthStateChanged.mockReturnValue(() => {});

      const unsubscribe = authService.onAuthStateChanged(mockCallback);

      expect(mockOnAuthStateChanged).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });
  });
});
