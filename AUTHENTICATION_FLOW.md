# Authentication Microservice Flow

## Overview
This application is a **pure authentication microservice**. It does NOT have dashboards, profiles, or any other pages. Its sole purpose is to authenticate users and redirect them to their respective microfrontend applications.

## Complete Authentication Flow

### 1. User Visits Login Page
- URL: `https://rental-user-management-frontend-sigma.vercel.app/login`
- User enters email and password OR uses Google OAuth

### 2. Authentication Process
- Credentials are sent to backend API: `https://rent-managment-system-user-magt.onrender.com/api/v1`
- Backend validates credentials and returns:
  - Access token
  - User details (including role: admin/landlord/tenant)

### 3. Automatic Redirect (Happens Immediately)
Based on user role, the system redirects to:

**Admin Users:**
```
https://admin-chi-red-24.vercel.app/auth/callback?token=<access_token>
```

**Landlord Users:**
```
https://rent-management-landlord-frontend.vercel.app/auth/callback?token=<access_token>
```

**Tenant Users:**
```
https://search-and-filter-frontend.vercel.app/auth/callback?token=<access_token>
```

### 4. Token Handoff
- The access token is passed via URL parameter: `?token=<encoded_token>`
- The destination microfrontend receives the token
- The destination app can then:
  - Store the token in localStorage
  - Fetch user details
  - Display the appropriate dashboard

## Important: No Local Routes

This authentication service does NOT have:
- ❌ `/dashboard` - Removed
- ❌ `/profile` - Removed
- ❌ `/profile/edit` - Removed
- ❌ Any protected routes - Removed

It ONLY has:
- ✅ `/login` - Login page
- ✅ `/signup` - Registration page
- ✅ `/auth/callback` - OAuth callback handler (also redirects to microfrontends)
- ✅ `/forgot-password` - Password recovery
- ✅ `/reset-password` - Password reset
- ✅ `/` - Redirects to `/login`

## What Happens When User Clicks Back Button?

After successful login, if a user clicks the browser back button:
- They will NOT see `/dashboard` 
- They will be redirected back to `/login`
- If they try to access any non-existent route, they get redirected to `/login`

## Browser History Behavior

1. User visits: `https://rental-user-management-frontend-sigma.vercel.app/login`
2. User logs in successfully
3. Browser redirects to: `https://admin-chi-red-24.vercel.app/auth/callback?token=...`
4. If user clicks back button → Goes back to login page (not dashboard)

## Code Implementation

### auth-store.ts
- `login()` function handles email/password authentication
- `googleAuth()` function handles Google OAuth
- Both functions redirect to microfrontends after successful authentication
- Uses `window.location.href` for hard redirect (no React Router navigation)

### LoginForm.tsx
- Calls `login()` or `googleAuth()` from auth-store
- Does NOT handle any navigation itself
- The redirect happens inside the auth-store

### AuthCallback.tsx
- Handles OAuth callbacks
- Fetches user details using the token
- Redirects to appropriate microfrontend based on role

### App.tsx
- Only defines authentication routes
- All other routes redirect to `/login`
- No dashboard or protected routes

## Environment Variables Required

```env
VITE_API_BASE_URL=https://rent-managment-system-user-magt.onrender.com/api/v1
VITE_ADMIN_MICROFRONTEND_URL=https://admin-chi-red-24.vercel.app/
VITE_LANDLORD_MICROFRONTEND_URL=https://rent-management-landlord-frontend.vercel.app
VITE_TENANT_MICROFRONTEND_URL=https://search-and-filter-frontend.vercel.app/
```

## Security Features

1. **Token in URL**: Token is passed via URL parameter (secure over HTTPS)
2. **Immediate Redirect**: No local storage of user data in auth service
3. **No Session**: Auth service doesn't maintain user sessions
4. **Clean URLs**: Tokens are removed from URL after being processed by destination app

## Troubleshooting

### Issue: User sees `/dashboard` after login
**Solution**: This has been fixed. The auth-store now handles all redirects directly to microfrontends.

### Issue: 404 error on page refresh
**Solution**: `vercel.json` is configured to handle all routes through the SPA router.

### Issue: User not redirected after login
**Solution**: Check that all environment variables are set correctly in Vercel dashboard.

## Testing the Flow

1. Visit: `https://rental-user-management-frontend-sigma.vercel.app/login`
2. Login with test credentials
3. Verify immediate redirect to microfrontend
4. Check that token is in URL of destination
5. Click back button - should return to login page (not dashboard)
