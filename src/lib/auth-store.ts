import { create } from 'zustand'
import apiClient from '@/lib/api-client'

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
  setTokenAndFetchUser: (token: string) => Promise<User>
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

  // Sets token and fetches user data
  setTokenAndFetchUser: async (token: string): Promise<User> => {
    set({ isLoading: true, error: null });
    try {
      // persist token
      localStorage.setItem('access_token', token);
      // set default header on apiClient so subsequent requests use it
      apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;

      // fetch user
      const userResponse = await apiClient.get('/users/me');
      const user = userResponse.data;

      if (user.role === 'owner') {
        user.role = 'landlord'
      }

      const userData: User = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role as 'admin' | 'landlord' | 'tenant',
        is_active: user.is_active,
        phone_number: user.phone_number,
        preferred_language: user.preferred_language,
        preferred_currency: user.preferred_currency,
      };

      set({ user: userData, token, isLoading: false });
      return userData;
    } catch (error: any) {
      // cleanup on failure
      localStorage.removeItem('access_token');
      delete apiClient.defaults.headers.common.Authorization;

      const errorMessage = error.response?.data?.detail || 'Failed to fetch user details with token.';
      set({
        error: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage,
        isLoading: false,
        user: null,
        token: null,
      });
      throw error;
    }
  },

 
  login: async (email: string, password: string): Promise<User> => {
    set({ isLoading: true, error: null })
    try {
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)

      const response = await apiClient.post('/auth/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const { access_token } = response.data
      if (!access_token) throw new Error('No access_token returned from login');

      
      localStorage.setItem('access_token', access_token)
      apiClient.defaults.headers.common.Authorization = `Bearer ${access_token}`

      
      const userResponse = await apiClient.get('/users/me')
      const user = userResponse.data

      if (user.role === 'owner') {
        user.role = 'landlord'
      }

      // Build redirect base url from env map
      let redirectBaseUrl = ''
      switch (user.role) {
        case 'admin':
          redirectBaseUrl = (import.meta.env.VITE_ADMIN_MICROFRONTEND_URL as string) || ''
          break
        case 'landlord':
          redirectBaseUrl = (import.meta.env.VITE_LANDLORD_MICROFRONTEND_URL as string) || ''
          break
        case 'tenant':
          redirectBaseUrl = (import.meta.env.VITE_TENANT_MICROFRONTEND_URL as string) || ''
          break
        default:
          throw new Error('Unknown user role for redirection.')
      }

      if (!redirectBaseUrl) {
        throw new Error(`Redirect URL not configured for role: ${user.role}`)
      }

      // sanitize base URL and token, use query param to match AuthCallback parsi
      const cleanBase = redirectBaseUrl.trim().replace(/\/+$/,'') // remove trail slash(es)
      const encodedToken = encodeURIComponent(access_token)
      const redirectUrl = `${cleanBase}/auth/callback?token=${encodedToken}`

      // Hard redirect user to role frontend callback (callback will fetch user and finalize)
      window.location.href = redirectUrl

      // Since we redirect, return a minimal user object for type safety
      return {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active,
        preferred_language: user.preferred_language,
        preferred_currency: user.preferred_currency,
      }
    } catch (error: any) {
      // ensure we cleanup token on error
      localStorage.removeItem('access_token')
      delete apiClient.defaults.headers.common.Authorization

      const errorMessage = error.response?.data?.detail || error.message || 'Login failed'
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

      const res = await apiClient.post('/users/register', body, {
        headers: { 'Content-Type': 'application/json' },
      })

      set({ isLoading: false })
      return res.data
    } catch (err: any) {
      console.error('register error data:', err?.response?.data)
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
    delete apiClient.defaults.headers.common.Authorization
    set({ user: null, token: null })
  },

  // ✅ REFRESH TOKEN (placeholder)
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
