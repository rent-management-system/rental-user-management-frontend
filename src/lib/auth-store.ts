import { create } from "zustand"
import { apiClient } from "./api-client"

interface User {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  phone_number?: string | null
  preferred_language?: string
  preferred_currency?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>
  signup: (
    full_name: string, 
    email: string, 
    password: string, 
    phone: string, 
    role: string,
    preferred_language?: string,
    preferred_currency?: string
  ) => Promise<void>
  googleAuth: (token: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  clearError: () => void
  refreshUser: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const { user, token } = await apiClient.login(email, password)
      set({ user, token, isLoading: false })
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please check your credentials.'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  signup: async (
    full_name: string, 
    email: string, 
    password: string, 
    phone: string, 
    role: string, 
    preferred_language: string = 'en', 
    preferred_currency: string = 'ETB'
  ) => {
    set({ isLoading: true, error: null })
    try {
      console.log('Calling apiClient.signup with:', {
        full_name,
        email,
        phone,
        role,
        preferred_language,
        preferred_currency
      });
      
      const { user, token } = await apiClient.signup(
        full_name, 
        email, 
        password, 
        phone, 
        role,
        preferred_language,
        preferred_currency
      )
      set({ user, token, isLoading: false })
    } catch (error: any) {
      console.error('Signup error in auth store:', error)
      const errorMessage = error.message || 'Signup failed. Please try again.'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  googleAuth: async (token: string) => {
    set({ isLoading: true, error: null })
    try {
      const { user, token: authToken } = await apiClient.googleAuth(token)
      set({ user, token: authToken, isLoading: false })
    } catch (error: any) {
      const errorMessage = error.message || 'Google authentication failed.'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null, token: null, error: null })
  },

  refreshUser: async () => {
    try {
      const user = await apiClient.getProfile()
      set({ user })
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      get().logout()
    }
  },

  setUser: (user: User | null) => set({ user }),
  setToken: (token: string | null) => set({ token }),
  clearError: () => set({ error: null }),
}))
