import { useAuthStore } from "@/lib/auth-store"

export const useAuth = () => {
  const { user, token, isLoading, error, login, signup, googleAuth, logout, clearError } = useAuthStore()

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!token,
    login,
    signup,
    googleAuth,
    logout,
    clearError,
  }
}
