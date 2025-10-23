# Setup Guide for Rental User Management Module

## Quick Start

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment
Create `.env` file:
\`\`\`env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
\`\`\`

### 3. Start Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000`

## Development Workflow

### Running Tests
\`\`\`bash
npm run test              # Run tests once
npm run test:ui          # Run tests with UI
\`\`\`

### Building for Production
\`\`\`bash
npm run build            # Build optimized bundle
npm run preview          # Preview production build locally
\`\`\`

### Code Quality
\`\`\`bash
npm run lint             # Run ESLint
\`\`\`

## Backend Integration

### Mock API Setup (for development)

If you don't have a backend yet, you can mock API responses:

1. Install `msw` (Mock Service Worker):
\`\`\`bash
npm install -D msw
\`\`\`

2. Create `src/lib/mocks/handlers.ts`:
\`\`\`typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      token: 'mock_jwt_token',
      user: {
        id: '1',
        email: body.email,
        name: 'Test User',
        role: 'tenant',
        preferredLanguage: 'en',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    })
  }),
  // Add more handlers as needed
]
\`\`\`

3. Setup MSW in `src/main.tsx`:
\`\`\`typescript
import { setupServer } from 'msw/node'
import { handlers } from './lib/mocks/handlers'

const server = setupServer(...handlers)
server.listen()
\`\`\`

## Deployment

### Deploy to Vercel
\`\`\`bash
npm install -g vercel
vercel
\`\`\`

### Deploy to Netlify
\`\`\`bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
\`\`\`

### Docker Deployment
Create `Dockerfile`:
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
\`\`\`

Build and run:
\`\`\`bash
docker build -t rental-user-management .
docker run -p 3000:3000 rental-user-management
\`\`\`

## Troubleshooting

### Port 3000 already in use
\`\`\`bash
# Change port in vite.config.ts or use:
npm run dev -- --port 3001
\`\`\`

### Module not found errors
\`\`\`bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Build fails
\`\`\`bash
# Clear Vite cache
rm -rf dist .vite
npm run build
\`\`\`

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:5000/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | `xxx.apps.googleusercontent.com` |

## Performance Tips

1. **Enable compression** in your server
2. **Use CDN** for static assets
3. **Implement caching** headers
4. **Monitor bundle size** with `npm run build -- --analyze`
5. **Use lazy loading** for routes

## Security Checklist

- [ ] Set secure CORS headers on backend
- [ ] Use HTTPS in production
- [ ] Implement rate limiting on backend
- [ ] Validate all inputs on backend
- [ ] Use secure HTTP-only cookies for tokens
- [ ] Implement CSRF protection
- [ ] Add security headers (CSP, X-Frame-Options, etc.)
- [ ] Regular security audits

## Getting Help

- Check the main README.md for detailed documentation
- Review test files for usage examples
- Check browser console for error messages
- Verify backend API is running and accessible
