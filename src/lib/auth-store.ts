import { create } from "zustand"
import type { User, AuthState } from "@/types"
import { apiClient } from "./api-client"

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, role: string) => Promise<void>
  googleAuth: (token: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  clearError: () => void
}

export const useAuthStore = create<AuthStore>((set) => {
  // Initialize from localStorage
  const storedToken = localStorage.getItem("auth_token")
  const storedUser = localStorage.getItem("auth_user")

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken,
    isLoading: false,
    error: null,

    login: async (email: string, password: string) => {
      set({ isLoading: true, error: null })
      try {
        const response = await apiClient.login(email, password)
        localStorage.setItem("auth_token", response.token)
        localStorage.setItem("auth_user", JSON.stringify(response.user))
        set({ user: response.user, token: response.token, isLoading: false })
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Login failed"
        set({ error: errorMessage, isLoading: false })
        throw error
      }
    },

    signup: async (name: string, email: string, password: string, role: string) => {
      set({ isLoading: true, error: null })
      try {
        const response = await apiClient.signup(name, email, password, role)
        localStorage.setItem("auth_token", response.token)
        localStorage.setItem("auth_user", JSON.stringify(response.user))
        set({ user: response.user, token: response.token, isLoading: false })
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Signup failed"
        set({ error: errorMessage, isLoading: false })
        throw error
      }
    },

    googleAuth: async (token: string) => {
      set({ isLoading: true, error: null })
      try {
        const response = await apiClient.googleAuth(token)
        localStorage.setItem("auth_token", response.token)
        localStorage.setItem("auth_user", JSON.stringify(response.user))
        set({ user: response.user, token: response.token, isLoading: false })
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Google auth failed"
        set({ error: errorMessage, isLoading: false })
        throw error
      }
    },

    logout: () => {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("auth_user")
      set({ user: null, token: null, error: null })
    },

    setUser: (user: User | null) => set({ user }),
    setToken: (token: string | null) => set({ token }),
    clearError: () => set({ error: null }),
  }
})
