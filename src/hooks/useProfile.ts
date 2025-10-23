import { useProfileStore } from "@/lib/profile-store"

export const useProfile = () => {
  const { profile, isLoading, error, fetchProfile, updateProfile, clearError } = useProfileStore()

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    clearError,
  }
}
