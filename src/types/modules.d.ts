// Type declarations for modules without types
declare module '@/components/auth/LoginForm' {
  import { FC } from 'react';
  const LoginForm: FC<{}>;
  export default LoginForm;
}

declare module '@/lib/auth-store' {
  export const useAuthStore: any; // Replace 'any' with the actual type
  // Add other exports from auth-store if needed
}

declare module '@/types' {
  export * from './index';
}

declare module '@/types/index' {
  export * from './index';
}
