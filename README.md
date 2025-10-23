# Rental User Management Frontend Module

A production-ready micro-frontend module for user management in a rental application. Built with React 18, TypeScript, Vite, and Tailwind CSS.

## Features

### Authentication
- Email/password login and signup
- Google OAuth integration
- JWT token management with localStorage persistence
- Role-based redirects (tenant, landlord, admin)
- Forgot password and reset flows

### Profile Management
- Editable user profiles with validation
- Profile photo upload with file validation (max 5MB, image files only)
- Language preference selection (English, Amharic, Afaan Oromo)
- Read-only email and role fields

### Role-Based UI
- Conditional rendering based on user roles
- Tenant dashboard: saved properties, applications, activity
- Landlord dashboard: active listings, pending applications, views
- Admin dashboard: user management, property management, reports

### Multilingual Support
- Full i18n support with react-i18next
- Three languages: English, Amharic, Afaan Oromo
- Language persistence in localStorage
- Language switcher in header

### Theming
- Dark mode support with CSS variables
- System preference detection
- Theme persistence in localStorage
- Theme toggle in header

### Security
- Input validation with Zod
- XSS prevention through React's built-in escaping
- CSRF protection ready (implement on backend)
- HttpOnly cookie support for tokens
- Role-based access control

### Error Handling
- Global error boundary component
- API error handler with HTTP status mapping
- Toast notifications for user feedback
- Loading states and spinners

## Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── dashboard/         # Role-specific dashboards
│   │   ├── TenantDashboard.tsx
│   │   ├── LandlordDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── layout/            # Layout components
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── profile/           # Profile components
│   │   ├── ProfileEditor.tsx
│   │   └── ProfileView.tsx
│   └── common/            # Shared components
│       ├── ErrorBoundary.tsx
│       ├── LoadingSpinner.tsx
│       └── Toast.tsx
├── features/              # Feature-specific logic
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts
│   ├── useProfile.ts
│   └── useTheme.ts
├── lib/                   # Utilities and helpers
│   ├── api-client.ts      # Axios instance
│   ├── auth-store.ts      # Zustand auth store
│   ├── profile-store.ts   # Zustand profile store
│   ├── error-handler.ts   # Error handling utilities
│   ├── validation.ts      # Input validation
│   ├── i18n.ts            # i18n configuration
│   └── utils.ts           # General utilities
├── locales/               # Translation files
│   ├── en.json
│   ├── am.json
│   └── om.json
├── pages/                 # Page components
│   └── Dashboard.tsx
├── types/                 # TypeScript interfaces
│   └── index.ts
├── __tests__/             # Test files
├── App.tsx                # Main app component
├── main.tsx               # Entry point
└── index.css              # Global styles
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn

### Installation

1. **Clone the repository**
   ```
   git clone <repository-url>
   cd rental-user-management
   ```

2. **Install dependencies**
  ```
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
```
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Start development server**
   ```
   npm run dev
   ```

   The app will open at `http://localhost:3000`

### Build for Production

\`\`\`bash
npm run build
\`\`\`

The optimized build will be in the `dist/` directory.

### Run Tests

```
npm run test
```

Run tests with UI:
```
npm run test:ui
```

## API Integration

The module expects the following backend endpoints:

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### User Profile
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update user profile (supports multipart/form-data for photo upload)

### Expected Response Format

**Login/Signup Response:**
```
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "tenant",
    "profilePhoto": "url_or_null",
    "preferredLanguage": "en",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Error Response:**
```
{
  "message": "Error description",
  "statusCode": 400
}
```

## Configuration

### Tailwind CSS Theme

The app uses CSS variables for theming. Customize colors in `src/index.css`:

```
:root {
  --primary: 59 130 246;           /* Blue for trust */
  --secondary: 34 197 94;          /* Green for affordability */
  --accent: 168 85 247;            /* Purple for highlights */
  --background: 255 255 255;
  --foreground: 15 23 42;
  --muted: 226 232 240;
  --border: 226 232 240;
}
```

### i18n Configuration

Add new languages by:
1. Creating a new JSON file in `src/locales/`
2. Importing it in `src/lib/i18n.ts`
3. Adding the language option to language selectors

## Security Considerations

1. **Token Storage**: Currently uses localStorage. For production, consider:
   - HttpOnly cookies (more secure, requires backend support)
   - Encrypted localStorage
   - In-memory storage with refresh token rotation

2. **CORS**: Configure backend CORS to only allow your frontend domain

3. **Input Validation**: All inputs are validated with Zod before submission

4. **XSS Prevention**: React automatically escapes content

5. **CSRF Protection**: Implement CSRF tokens on the backend

## Performance Optimization

- Code splitting with React Router
- Lazy loading of dashboard components
- Memoization of expensive computations
- Image optimization for profile photos
- CSS-in-JS with Tailwind for minimal bundle size

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Troubleshooting

### Login not working
- Check API base URL in `.env`
- Verify backend is running
- Check browser console for CORS errors

### Images not loading
- Ensure profile photo URLs are accessible
- Check image file size (max 5MB)
- Verify image format is supported

### Language not changing
- Clear localStorage and refresh
- Check browser console for i18n errors
- Verify translation files are loaded

## Next Steps for Integration

1. **Connect to Backend**: Update API endpoints in `src/lib/api-client.ts`
2. **Implement Module Federation**: Use Webpack or Vite plugin for micro-frontend setup
3. **Add More Features**: Extend dashboards with additional functionality
4. **Setup CI/CD**: Configure GitHub Actions or similar for automated testing/deployment
5. **Add Analytics**: Integrate analytics library for user tracking
6. **Implement Notifications**: Add real-time notifications with WebSocket

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests for new features
4. Submit a pull request

## License

MIT

## Support

For issues or questions, please open an issue in the repository or contact the development team.
