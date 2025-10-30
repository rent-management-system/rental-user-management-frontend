// Global type definitions for the application
declare global {
  type UserRole = "tenant" | "landlord" | "admin"

  interface User {
    id: string
    email: string
    full_name: string
    name?: string
    phone_number?: string | null
    phone?: string
    role: UserRole
    profile_photo?: string
    profilePhoto?: string
    preferred_language: "en" | "am" | "om"
    preferredLanguage?: "en" | "am" | "om"
    preferred_currency?: 'ETB' | 'USD'
    created_at?: string
    updated_at?: string
    createdAt?: string
    updatedAt?: string
  }

  interface ProfileUpdateData {
    name?: string
    full_name?: string
    phone?: string
    phone_number?: string | null
    preferred_language?: "en" | "am" | "om"
    preferredLanguage?: "en" | "am" | "om"
    profile_photo?: string
    profilePhoto?: string | File
    preferred_currency?: 'ETB' | 'USD'
  }

  // Add this to make TypeScript aware of the global type
  interface Window {
    // Add any window extensions here if needed
  }
}

// This is needed to make the file a module
export {}
