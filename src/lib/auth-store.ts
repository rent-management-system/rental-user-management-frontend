import { create } from 'zustand'
import { apiClient } from '@/lib/api-client'

// ---------- Types ----------
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
  ) => Promise<any>
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

// ---------- Zustand Store ----------
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  isLoading: false,
  error: null,

  // ✅ LOGIN
  login: async (email: string, password: string): Promise<User> => {
    set({ isLoading: true, error: null })
    try {
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)

      // Backend login endpoint: /api/v1/auth/login
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
        error: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage,
        isLoading: false,
      })
      throw error
    }
  },

  // ✅ REGISTER
  register: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const {
        email,
        password,
        full_name,
        phone_number,
        role,
        preferred_language,
        preferred_currency,
      } = payload as any

      const body = {
        email,
        password,
        full_name,
        ...(phone_number ? { phone_number } : {}),
        ...(role ? { role } : {}),
        ...(preferred_language ? { preferred_language } : {}),
        ...(preferred_currency ? { preferred_currency } : {}),
      }

      // ✅ Correct path: no /v1 prefix, since apiClient already has /api/v1 base
      const res = await apiClient.post('/users/register', body, {
        headers: { 'Content-Type': 'application/json' },
      })

      set({ isLoading: false })
      return res.data
    } catch (err: any) {
      // Detailed debug logs for backend errors
      console.error('register error data:', err?.response?.data)
      console.error('register error status:', err?.response?.status)
      console.error('register axios message:', err?.message)

      const serverPayload = err?.response?.data
      const message =
        serverPayload?.detail ||
        serverPayload?.message ||
        (typeof serverPayload === 'string' ? serverPayload : null) ||
        err?.message ||
        'Registration failed'

      set({
        isLoading: false,
        error: Array.isArray(message) ? message[0] : message,
      })
      throw err
    }
  },

  // ✅ LOGOUT
  logout: () => {
    localStorage.removeItem('access_token')
    set({ user: null, token: null })
  },

  // ✅ REFRESH TOKEN
  refreshToken: async () => {
    return localStorage.getItem('access_token') || ''
  },

  // ✅ UPDATE USER LOCALLY
  updateUser: (userData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    })),

  // ✅ CLEAR ERROR STATE
  clearError: () => set({ error: null }),
}))
