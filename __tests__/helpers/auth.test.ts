import { getAuth, isAuthenticated, isAdmin } from '@/lib/helpers/auth';
import { NextRequest } from 'next/server';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Mock Firebase Admin
jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(),
}));

jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(),
  cert: jest.fn(),
}));

const mockGetFirebaseAuth = getFirebaseAuth as jest.MockedFunction<typeof getFirebaseAuth>;
const mockInitializeApp = initializeApp as jest.MockedFunction<typeof initializeApp>;
const mockGetApps = getApps as jest.MockedFunction<typeof getApps>;
const mockCert = cert as jest.MockedFunction<typeof cert>;

describe('auth helpers', () => {
  let mockRequest: NextRequest;
  let mockVerifyIdToken: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console methods to avoid noise in test output
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Setup mock Firebase Auth
    mockVerifyIdToken = jest.fn();
    mockGetFirebaseAuth.mockReturnValue({
      verifyIdToken: mockVerifyIdToken,
    } as any);

    // Mock environment variables
    process.env.FIREBASE_PROJECT_ID = 'test-project';
    process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
    process.env.FIREBASE_PRIVATE_KEY = 'test-key';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.FIREBASE_PROJECT_ID;
    delete process.env.FIREBASE_CLIENT_EMAIL;
    delete process.env.FIREBASE_PRIVATE_KEY;
  });

  const createMockRequest = (headers: Record<string, string> = {}): NextRequest => {
    return {
      headers: {
        get: (name: string) => headers[name.toLowerCase()] || null,
      },
    } as NextRequest;
  };

  describe('getAuth', () => {
    it('should authenticate user with valid Bearer token', async () => {
      const mockToken = 'valid-token';
      const mockDecodedToken = {
        uid: 'user-123',
        email: 'test@example.com',
        role: 'admin',
      };

      mockGetApps.mockReturnValue([{ name: 'test-app' }] as any);
      mockVerifyIdToken.mockResolvedValue(mockDecodedToken);

      mockRequest = createMockRequest({
        authorization: `Bearer ${mockToken}`,
      });

      const result = await getAuth(mockRequest);

      expect(result.user).toEqual({
        uid: 'user-123',
        email: 'test@example.com',
        role: 'admin',
      });
      expect(result.error).toBeUndefined();
      expect(mockVerifyIdToken).toHaveBeenCalledWith(mockToken);
    });

    it('should authenticate user with valid cookie token', async () => {
      const mockToken = 'valid-cookie-token';
      const mockDecodedToken = {
        uid: 'user-456',
        email: 'cookie@example.com',
        role: 'user',
      };

      mockGetApps.mockReturnValue([{ name: 'test-app' }] as any);
      mockVerifyIdToken.mockResolvedValue(mockDecodedToken);

      mockRequest = createMockRequest({
        cookie: `other-cookie=value; auth-token=${mockToken}; another=value`,
      });

      const result = await getAuth(mockRequest);

      expect(result.user).toEqual({
        uid: 'user-456',
        email: 'cookie@example.com',
        role: 'user',
      });
      expect(mockVerifyIdToken).toHaveBeenCalledWith(mockToken);
    });

    it('should prefer Bearer token over cookie', async () => {
      const bearerToken = 'bearer-token';
      const cookieToken = 'cookie-token';
      const mockDecodedToken = {
        uid: 'user-123',
        email: 'test@example.com',
        role: 'admin',
      };

      mockGetApps.mockReturnValue([{ name: 'test-app' }] as any);
      mockVerifyIdToken.mockResolvedValue(mockDecodedToken);

      mockRequest = createMockRequest({
        authorization: `Bearer ${bearerToken}`,
        cookie: `auth-token=${cookieToken}`,
      });

      const result = await getAuth(mockRequest);

      expect(result.user).toBeDefined();
      expect(mockVerifyIdToken).toHaveBeenCalledWith(bearerToken);
      expect(mockVerifyIdToken).not.toHaveBeenCalledWith(cookieToken);
    });

    it('should return null user when no token provided', async () => {
      mockRequest = createMockRequest({});

      const result = await getAuth(mockRequest);

      expect(result.user).toBeNull();
      expect(result.error).toBeUndefined();
      expect(mockVerifyIdToken).not.toHaveBeenCalled();
    });

    it('should initialize Firebase Admin when not initialized', async () => {
      mockGetApps.mockReturnValueOnce([]); // Not initialized
      mockGetApps.mockReturnValue([{ name: 'test-app' }] as any); // After initialization

      const mockToken = 'valid-token';
      const mockDecodedToken = {
        uid: 'user-123',
        email: 'test@example.com',
        role: 'user',
      };

      mockVerifyIdToken.mockResolvedValue(mockDecodedToken);
      mockCert.mockReturnValue('mock-credential' as any);

      mockRequest = createMockRequest({
        authorization: `Bearer ${mockToken}`,
      });

      const result = await getAuth(mockRequest);

      expect(mockInitializeApp).toHaveBeenCalledWith({
        credential: 'mock-credential',
      });
      expect(mockCert).toHaveBeenCalledWith({
        projectId: 'test-project',
        clientEmail: 'test@test.com',
        privateKey: 'test-key',
      });
      expect(result.user).toBeDefined();
    });

    it('should handle missing Firebase Admin credentials', async () => {
      delete process.env.FIREBASE_PROJECT_ID;
      mockGetApps.mockReturnValue([]); // Not initialized

      const mockToken = 'valid-token';
      mockRequest = createMockRequest({
        authorization: `Bearer ${mockToken}`,
      });

      const result = await getAuth(mockRequest);

      expect(console.warn).toHaveBeenCalledWith(
        'Firebase Admin credentials not found, skipping initialization'
      );
      expect(console.warn).toHaveBeenCalledWith(
        'Firebase Admin not initialized, authentication skipped'
      );
      expect(result.user).toBeNull();
      expect(mockInitializeApp).not.toHaveBeenCalled();
    });

    it('should handle token verification errors', async () => {
      const mockToken = 'invalid-token';
      const mockError = new Error('Token verification failed');

      mockGetApps.mockReturnValue([{ name: 'test-app' }] as any);
      mockVerifyIdToken.mockRejectedValue(mockError);

      mockRequest = createMockRequest({
        authorization: `Bearer ${mockToken}`,
      });

      const result = await getAuth(mockRequest);

      expect(result.user).toBeNull();
      expect(result.error).toBe('Token verification failed');
      expect(console.error).toHaveBeenCalledWith('Auth error:', mockError);
    });

    it('should handle non-Error exceptions', async () => {
      const mockToken = 'invalid-token';

      mockGetApps.mockReturnValue([{ name: 'test-app' }] as any);
      mockVerifyIdToken.mockRejectedValue('String error');

      mockRequest = createMockRequest({
        authorization: `Bearer ${mockToken}`,
      });

      const result = await getAuth(mockRequest);

      expect(result.user).toBeNull();
      expect(result.error).toBe('Authentication failed');
    });

    it('should handle decoded token without email', async () => {
      const mockToken = 'valid-token';
      const mockDecodedToken = {
        uid: 'user-123',
        // No email field
        role: 'user',
      };

      mockGetApps.mockReturnValue([{ name: 'test-app' }] as any);
      mockVerifyIdToken.mockResolvedValue(mockDecodedToken);

      mockRequest = createMockRequest({
        authorization: `Bearer ${mockToken}`,
      });

      const result = await getAuth(mockRequest);

      expect(result.user).toEqual({
        uid: 'user-123',
        email: '', // Default empty string
        role: 'user',
      });
    });

    it('should handle decoded token without role', async () => {
      const mockToken = 'valid-token';
      const mockDecodedToken = {
        uid: 'user-123',
        email: 'test@example.com',
        // No role field
      };

      mockGetApps.mockReturnValue([{ name: 'test-app' }] as any);
      mockVerifyIdToken.mockResolvedValue(mockDecodedToken);

      mockRequest = createMockRequest({
        authorization: `Bearer ${mockToken}`,
      });

      const result = await getAuth(mockRequest);

      expect(result.user).toEqual({
        uid: 'user-123',
        email: 'test@example.com',
        role: 'user', // Default role
      });
    });

    it('should handle malformed Bearer header', async () => {
      mockRequest = createMockRequest({
        authorization: 'Bearer', // Missing token
      });

      const result = await getAuth(mockRequest);

      expect(result.user).toBeNull();
      expect(mockVerifyIdToken).not.toHaveBeenCalled();
    });

    it('should handle malformed Authorization header', async () => {
      mockRequest = createMockRequest({
        authorization: 'Basic dXNlcjpwYXNz', // Not Bearer
      });

      const result = await getAuth(mockRequest);

      expect(result.user).toBeNull();
      expect(mockVerifyIdToken).not.toHaveBeenCalled();
    });

    it('should parse cookies correctly', async () => {
      const mockToken = 'cookie-token';
      const mockDecodedToken = {
        uid: 'user-123',
        email: 'test@example.com',
        role: 'user',
      };

      mockGetApps.mockReturnValue([{ name: 'test-app' }] as any);
      mockVerifyIdToken.mockResolvedValue(mockDecodedToken);

      mockRequest = createMockRequest({
        cookie: 'first=value1; auth-token=cookie-token; last=value2',
      });

      const result = await getAuth(mockRequest);

      expect(result.user).toBeDefined();
      expect(mockVerifyIdToken).toHaveBeenCalledWith(mockToken);
    });

    it('should handle private key with escaped newlines', async () => {
      process.env.FIREBASE_PRIVATE_KEY = 'line1\\nline2\\nline3';
      
      mockGetApps.mockReturnValueOnce([]); // Not initialized
      mockGetApps.mockReturnValue([{ name: 'test-app' }] as any);

      const mockToken = 'valid-token';
      const mockDecodedToken = {
        uid: 'user-123',
        email: 'test@example.com',
        role: 'user',
      };

      mockVerifyIdToken.mockResolvedValue(mockDecodedToken);
      mockCert.mockReturnValue('mock-credential' as any);

      mockRequest = createMockRequest({
        authorization: `Bearer ${mockToken}`,
      });

      await getAuth(mockRequest);

      expect(mockCert).toHaveBeenCalledWith({
        projectId: 'test-project',
        clientEmail: 'test@test.com',
        privateKey: 'line1\nline2\nline3', // Newlines properly converted
      });
    });
  });

  describe('isAuthenticated', () => {
    it('should return true for authenticated user', async () => {
      const mockToken = 'valid-token';
      const mockDecodedToken = {
        uid: 'user-123',
        email: 'test@example.com',
        role: 'user',
      };

      mockGetApps.mockReturnValue([{ name: 'test-app' }] as any);
      mockVerifyIdToken.mockResolvedValue(mockDecodedToken);

      mockRequest = createMockRequest({
        authorization: `Bearer ${mockToken}`,
      });

      const result = await isAuthenticated(mockRequest);

      expect(result).toBe(true);
    });

    it('should return false for unauthenticated user', async () => {
      mockRequest = createMockRequest({});

      const result = await isAuthenticated(mockRequest);

      expect(result).toBe(false);
    });

    it('should return false when auth fails', async () => {
      const mockToken = 'invalid-token';

      mockGetApps.mockReturnValue([{ name: 'test-app' }] as any);
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

      mockRequest = createMockRequest({
        authorization: `Bearer ${mockToken}`,
      });

      const result = await isAuthenticated(mockRequest);

      expect(result).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin user', async () => {
      const mockToken = 'valid-token';
      const mockDecodedToken = {
        uid: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
      };

      mockGetApps.mockReturnValue([{ name: 'test-app' }] as any);
      mockVerifyIdToken.mockResolvedValue(mockDecodedToken);

      mockRequest = createMockRequest({
        authorization: `Bearer ${mockToken}`,
      });

      const result = await isAdmin(mockRequest);

      expect(result).toBe(true);
    });

    it('should return false for regular user', async () => {
      const mockToken = 'valid-token';
      const mockDecodedToken = {
        uid: 'user-123',
        email: 'user@example.com',
        role: 'user',
      };

      mockGetApps.mockReturnValue([{ name: 'test-app' }] as any);
      mockVerifyIdToken.mockResolvedValue(mockDecodedToken);

      mockRequest = createMockRequest({
        authorization: `Bearer ${mockToken}`,
      });

      const result = await isAdmin(mockRequest);

      expect(result).toBe(false);
    });

    it('should return false for unauthenticated user', async () => {
      mockRequest = createMockRequest({});

      const result = await isAdmin(mockRequest);

      expect(result).toBe(false);
    });

    it('should return false when auth fails', async () => {
      const mockToken = 'invalid-token';

      mockGetApps.mockReturnValue([{ name: 'test-app' }] as any);
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

      mockRequest = createMockRequest({
        authorization: `Bearer ${mockToken}`,
      });

      const result = await isAdmin(mockRequest);

      expect(result).toBe(false);
    });
  });

  // Integration tests
  describe('integration scenarios', () => {
    it('should handle complete authentication flow', async () => {
      const mockToken = 'integration-test-token';
      const mockDecodedToken = {
        uid: 'user-123',
        email: 'test@example.com',
        role: 'admin',
      };

      mockGetApps.mockReturnValue([{ name: 'test-app' }] as any);
      mockVerifyIdToken.mockResolvedValue(mockDecodedToken);

      mockRequest = createMockRequest({
        authorization: `Bearer ${mockToken}`,
      });

      // Test all three functions with the same request
      const authResult = await getAuth(mockRequest);
      const authenticated = await isAuthenticated(mockRequest);
      const adminCheck = await isAdmin(mockRequest);

      expect(authResult.user).toEqual({
        uid: 'user-123',
        email: 'test@example.com',
        role: 'admin',
      });
      expect(authenticated).toBe(true);
      expect(adminCheck).toBe(true);

      // Should have called verifyIdToken three times
      expect(mockVerifyIdToken).toHaveBeenCalledTimes(3);
    });

    it('should handle Firebase Admin initialization only once', async () => {
      mockGetApps.mockReturnValueOnce([]); // First call - not initialized
      mockGetApps.mockReturnValue([{ name: 'test-app' }] as any); // Subsequent calls - initialized

      const mockToken = 'test-token';
      const mockDecodedToken = {
        uid: 'user-123',
        email: 'test@example.com',
        role: 'user',
      };

      mockVerifyIdToken.mockResolvedValue(mockDecodedToken);
      mockCert.mockReturnValue('mock-credential' as any);

      mockRequest = createMockRequest({
        authorization: `Bearer ${mockToken}`,
      });

      // Make multiple auth calls
      await getAuth(mockRequest);
      await getAuth(mockRequest);
      await isAuthenticated(mockRequest);

      // Should only initialize once
      expect(mockInitializeApp).toHaveBeenCalledTimes(1);
    });
  });
});
