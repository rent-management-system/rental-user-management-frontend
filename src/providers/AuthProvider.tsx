import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Toaster } from 'react-hot-toast';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoading } = useAuthStore();

  // You can get this from your environment variables
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
      <Toaster position="top-right" />
    </GoogleOAuthProvider>
  );
}
