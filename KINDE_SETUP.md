# Kinde Authentication Setup

This project uses Kinde for authentication with Google OAuth and email/password login.

## Setup Instructions

### 1. Create a Kinde Account

1. Go to [Kinde](https://kinde.com) and create an account
2. Create a new application
3. Note down your:
   - Client ID
   - Client Secret
   - Issuer URL (e.g., `https://your-domain.kinde.com`)

### 2. Configure Environment Variables

Update your `.env.local` file with your Kinde credentials:

```env
# Kinde Authentication
KINDE_CLIENT_ID=your_kinde_client_id
KINDE_CLIENT_SECRET=your_kinde_client_secret
KINDE_ISSUER_URL=https://your-domain.kinde.com
KINDE_SITE_URL=http://localhost:3000
KINDE_POST_LOGIN_REDIRECT_URL=/admin
KINDE_POST_LOGOUT_REDIRECT_URL=/
```

### 3. Configure Kinde Application

In your Kinde dashboard:

1. **Redirect URLs**: Add `http://localhost:3000/api/auth/kinde`
2. **Allowed Origins**: Add `http://localhost:3000`
3. **Enable Google OAuth**:
   - Go to "Connections" → "Social"
   - Enable Google
   - Configure Google OAuth credentials

### 4. Google OAuth Setup (for Google Sign-in)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-domain.kinde.com/oauth2/auth`
6. Copy Client ID and Client Secret to Kinde Google configuration

### 5. Test the Setup

1. Start the development server: `pnpm dev`
2. Visit `http://localhost:3000/login`
3. Test both Google sign-in and email/password login

## Features

- ✅ Google OAuth sign-in
- ✅ Email/password authentication
- ✅ Protected admin routes
- ✅ User profile management
- ✅ Secure logout
- ✅ Automatic redirects

## File Structure

```
app/
├── login/page.tsx              # Login page
├── signup/page.tsx             # Signup page
├── api/auth/
│   ├── kinde/route.ts          # Kinde OAuth callback
│   ├── logout/route.ts         # Logout endpoint
│   └── me/route.ts             # User profile endpoint
lib/
└── kinde.ts                    # Kinde configuration
hooks/
└── useAuth.ts                  # Authentication hook
middleware.ts                   # Route protection
```

## Usage

### Login Page
- Visit `/login` to sign in
- Supports Google OAuth and email/password
- Redirects to `/admin` after successful login

### Signup Page
- Visit `/signup` to create account
- Supports Google OAuth and email/password registration
- Redirects to `/admin` after successful signup

### Protected Routes
- All `/admin/*` routes require authentication
- Unauthenticated users are redirected to `/login`
- Authenticated users are redirected to `/admin` when visiting login/signup

### User Profile
- Access user information via `useAuth()` hook
- User data includes: id, email, firstName, lastName, picture
- Profile picture from Google OAuth is automatically displayed

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**:
   - Ensure redirect URI in Kinde matches exactly: `http://localhost:3000/api/auth/kinde`

2. **Google OAuth not working**:
   - Verify Google OAuth credentials in Google Cloud Console
   - Check redirect URIs in Google OAuth settings
   - Ensure Google+ API is enabled

3. **Environment variables not loading**:
   - Restart the development server after updating `.env.local`
   - Ensure all required variables are set

4. **CORS errors**:
   - Add `http://localhost:3000` to allowed origins in Kinde
   - Check that all redirect URIs are properly configured

### Debug Mode

To enable debug logging, add to `.env.local`:
```env
DEBUG=true
```

## Security Notes

- Access tokens are stored in HTTP-only cookies
- Refresh tokens are automatically handled
- All authentication state is managed server-side
- Routes are protected via middleware
- Logout properly revokes tokens

## Production Deployment

For production:

1. Update `KINDE_SITE_URL` to your production domain
2. Update redirect URIs in Kinde dashboard
3. Update Google OAuth redirect URIs
4. Ensure HTTPS is enabled
5. Set `NODE_ENV=production` for secure cookies 