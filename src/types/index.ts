export type UserRole = "tenant" | "landlord" | "admin"

export interface User {
  id: string;
  email: string;
  full_name: string;
  name?: string;  // Make name optional since it's causing type errors
  phone_number?: string | null;
  phone?: string;  // Alias for phone_number
  role: UserRole;
  profile_photo?: string;
  profilePhoto?: string;  // Alias for profile_photo
  preferred_language: "en" | "am" | "om";
  preferredLanguage?: "en" | "am" | "om";  // Alias for preferred_language
  preferred_currency?: 'ETB' | 'USD';
  created_at?: string;
  updated_at?: string;
  createdAt?: string;  // Alias for created_at
  updatedAt?: string;  // Alias for updated_at
  
  // Add getters to handle both snake_case and camelCase properties
  getProfilePhoto?: () => string | undefined;
  getPreferredLanguage?: () => "en" | "am" | "om";
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
