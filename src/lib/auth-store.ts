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
      localStorage.setItem('access_token', token);
      const userResponse = await apiClient.get('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const user = userResponse.data;

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
      localStorage.removeItem('access_token');
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

      const { access_token } = response.data
      localStorage.setItem('access_token', access_token)

      // Fetch user details after successful login
      const userResponse = await apiClient.get('/users/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      const user = userResponse.data

      const userData: User = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role as 'admin' | 'landlord' | 'tenant',
        is_active: user.is_active,
        phone_number: user.phone_number,
        preferred_language: user.preferred_language,
        preferred_currency: user.preferred_currency,
      }

      set({ user: userData, token, isLoading: false });
      return userData;
    } catch (error: any) {
      localStorage.removeItem('access_token');
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

      const { access_token } = response.data

      // Fetch user details to determine role for redirection
      const userResponse = await apiClient.get('/users/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      const user = userResponse.data

      let redirectBaseUrl = ''
      switch (user.role) {
        case 'admin':
          redirectBaseUrl = import.meta.env.VITE_ADMIN_MICROFRONTEND_URL
          break
        case 'landlord':
          redirectBaseUrl = import.meta.env.VITE_LANDLORD_MICROFRONTEND_URL
          break
        case 'tenant':
          redirectBaseUrl = import.meta.env.VITE_TENANT_MICROFRONTEND_URL
          break
        default:
          // Fallback or error handling for unknown roles
          throw new Error('Unknown user role for redirection.')
      }

      if (!redirectBaseUrl) {
        throw new Error(`Redirect URL not configured for role: ${user.role}`)
      }

      // Construct the full redirect URL
      const redirectUrl = `${redirectBaseUrl}/auth/callback?token=${access_token}`

      // Perform hard redirect
      window.location.href = redirectUrl

      // This part of the code will not be reached due to the hard redirect
      // However, for type safety and completeness, we can return a dummy user
      // or adjust the return type of login if it's not expected to return a User directly anymore.
      // For now, we'll return a minimal user object.
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
      console.error('register error detail:', err?.response?.data?.detail) // Added this line
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
