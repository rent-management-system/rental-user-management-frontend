/// <reference types="vite/client" />

// This file is used to ensure TypeScript recognizes the @/ path alias
declare module "@/*" {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Ensure UserRole is globally available
declare module "@/types" {
  export type UserRole = "tenant" | "landlord" | "admin"
  
  export interface User {
    id: string;
    email: string;
    full_name: string;
    name?: string;
    phone_number?: string | null;
    phone?: string;
    role: UserRole;
    profile_photo?: string;
    profilePhoto?: string;
    preferred_language: "en" | "am" | "om";
    preferredLanguage?: "en" | "am" | "om";
    preferred_currency?: 'ETB' | 'USD';
    created_at?: string;
    updated_at?: string;
    createdAt?: string;
    updatedAt?: string;
    getProfilePhoto?: () => string | undefined;
    getPreferredLanguage?: () => "en" | "am" | "om";
  }

  export interface ProfileUpdateData {
    name?: string;
    full_name?: string;
    phone?: string;
    phone_number?: string | null;
    preferred_language?: "en" | "am" | "om";
    preferredLanguage?: "en" | "am" | "om";
    profile_photo?: string;
    profilePhoto?: string | File;
    preferred_currency?: 'ETB' | 'USD';
  }
}
