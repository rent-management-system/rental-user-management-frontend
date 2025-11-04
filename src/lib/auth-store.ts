import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { apiClient } from './api-client'

export interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'landlord' | 'tenant'
  is_active: boolean
  phone_number?: string
  preferred_language?: 'en' | 'am' | 'om'
  preferred_currency?: 'ETB' | 'USD'
  created_at?: string
  updated_at?: string
}

interface AuthActions {
  login: (email: string, password: string) => Promise<User>
  register: (
    userData: Omit<User, 'id' | 'is_active' | 'created_at' | 'updated_at'> & {
      password: string
    }
  ) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<string>
  updateUser: (userData: Partial<User>) => void
  clearError: () => void
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

export type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  isLoading: false,
  error: null,

  // ✅ LOGIN implementation
  login: async (email: string, password: string): Promise<User> => {
    set({ isLoading: true, error: null })
    try {
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)

      const response = await apiClient.post('/auth/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const { access_token, user } = response.data
      localStorage.setItem('access_token', access_token)

      const userData: User = {
        id: user.user_id || user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role as 'admin' | 'landlord' | 'tenant',
        is_active: user.is_active,
        phone_number: user.phone_number,
        preferred_language: user.preferred_language,
        preferred_currency: user.preferred_currency,
      }

      set({ user: userData, token: access_token, isLoading: false })
      return userData
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed'
      set({
        error: Array.isArray(errorMessage)
          ? errorMessage[0]
          : errorMessage,
        isLoading: false,
      })
      throw error
    }
  },

  // ✅ TEMP stubs (prevent TypeScript errors)
  register: async () => {},
  logout: () => {
    localStorage.removeItem('access_token')
    set({ user: null, token: null })
  },
  refreshToken: async () => {
    return localStorage.getItem('access_token') || ''
  },
  updateUser: (userData) => set((state) => ({
    user: state.user ? { ...state.user, ...userData } : null,
  })),
  clearError: () => set({ error: null }),
}))
