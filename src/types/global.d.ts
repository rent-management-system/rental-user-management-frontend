// Type definitions for modules without types
declare module '@/components/auth/LoginForm' {
  import { FC } from 'react';
  const LoginForm: FC;
  export default LoginForm;
}

declare module '@/lib/auth-store' {
  export const useAuthStore: any; // You should replace 'any' with the actual type
  // Add other exports from auth-store if needed
}

declare module '@/types' {
  export * from './index';
}

// Add type definitions for testing utilities
declare namespace jest {
  interface Matchers<R> {
    toBeInTheDocument(): R;
    toHaveAttribute(attr: string, value?: string): R;
    toBeDisabled(): R;
    // Add other custom matchers you're using
  }
}

declare const vi: {
  fn: () => jest.Mock;
  // Add other vitest globals you're using
};
