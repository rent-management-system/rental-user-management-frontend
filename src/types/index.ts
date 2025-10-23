export type UserRole = "tenant" | "landlord" | "admin"

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: UserRole
  profilePhoto?: string
  preferredLanguage: "en" | "am" | "om"
  createdAt: string
  updatedAt: string
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
  role: UserRole
}

export interface ProfileUpdateData {
  name?: string
  phone?: string
  preferredLanguage?: "en" | "am" | "om"
  profilePhoto?: File
}
