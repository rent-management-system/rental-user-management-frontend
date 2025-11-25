# Deployment Guide - Rental User Management Frontend

## Overview
This is an authentication microservice that handles user login, signup, and redirects users to their respective microfrontend applications based on their role (Admin, Landlord, or Tenant).

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=https://rent-managment-system-user-magt.onrender.com/api/v1

# Microfrontend URLs - Users will be redirected here after authentication
VITE_ADMIN_MICROFRONTEND_URL=https://admin-chi-red-24.vercel.app/
VITE_LANDLORD_MICROFRONTEND_URL=https://rent-management-landlord-frontend.vercel.app
VITE_TENANT_MICROFRONTEND_URL=https://search-and-filter-frontend.vercel.app/

# Google OAuth (optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

## Vercel Deployment

### Initial Setup
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure the following:

### Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Environment Variables (Vercel Dashboard)
Add all the environment variables from your `.env` file in the Vercel project settings:
- Go to Project Settings → Environment Variables
- Add each variable (VITE_API_BASE_URL, VITE_ADMIN_MICROFRONTEND_URL, etc.)
- Make sure to add them for Production, Preview, and Development environments

### Deploy
Click "Deploy" and Vercel will build and deploy your application.

## How It Works

### Authentication Flow
1. User visits the login page at your deployed URL
2. User enters credentials or uses Google OAuth
3. Backend API validates credentials and returns an access token
4. Frontend stores the token and fetches user details
5. Based on user role, the app redirects to the appropriate microfrontend:
   - **Admin** → Admin Microfrontend
   - **Landlord** → Landlord Microfrontend  
   - **Tenant** → Tenant Microfrontend
6. Token is passed to the microfrontend via URL parameter for seamless authentication

### Routes
- `/` - Redirects to login
- `/login` - Login page
- `/signup` - Registration page
- `/auth/callback` - Handles OAuth callbacks and redirects to microfrontends
- `/forgot-password` - Password recovery
- `/reset-password` - Password reset

## Troubleshooting

### 404 Errors on Page Refresh
The `vercel.json` configuration ensures all routes are handled by the SPA router. If you still see 404 errors:
1. Check that `vercel.json` exists in the root directory
2. Verify it contains the rewrite rule: `{ "source": "/(.*)", "destination": "/" }`
3. Redeploy the application

### Redirect Issues
If users aren't being redirected after login:
1. Verify all microfrontend URLs are correctly set in environment variables
2. Check that URLs don't have trailing slashes (they're automatically removed)
3. Ensure the microfrontend apps have an `/auth/callback` route that accepts the token parameter

### Environment Variables Not Working
1. Make sure all variables start with `VITE_` prefix
2. Rebuild and redeploy after changing environment variables
3. Clear browser cache and test in incognito mode

## Performance Optimizations

The application includes several production optimizations:
- **Code Splitting**: React and UI libraries are split into separate chunks
- **Minification**: JavaScript is minified using Terser
- **Console Removal**: All console.log statements are removed in production
- **Tree Shaking**: Unused code is automatically removed
- **Lazy Loading**: Routes are loaded on demand

## Security Best Practices

1. **Token Handling**: Tokens are passed via URL parameters and immediately stored in localStorage
2. **HTTPS Only**: Always use HTTPS in production
3. **Environment Variables**: Never commit `.env` files to version control
4. **CORS**: Backend API should have proper CORS configuration
5. **Token Expiration**: Implement token refresh logic if needed

## Monitoring

Monitor your application using:
- Vercel Analytics (built-in)
- Vercel Logs (for debugging)
- Browser DevTools Network tab (for API calls)

## Support

For issues or questions:
1. Check the application logs in Vercel Dashboard
2. Review browser console for client-side errors
3. Verify API endpoints are accessible
4. Ensure all environment variables are correctly configured
