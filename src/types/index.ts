export type UserRole = "tenant" | "landlord" | "admin"

export interface User {
  id: string
  email: string
  full_name: string
  name: string
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

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials extends LoginCredentials {
  name: string
  phone: string
  confirmPassword: string
  role: UserRole
}

export interface ProfileUpdateData {
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
