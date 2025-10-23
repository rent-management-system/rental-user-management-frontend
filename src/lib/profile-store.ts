import { create } from "zustand"
import type { User, ProfileUpdateData } from "@/types"
import { apiClient } from "./api-client"

interface ProfileStore {
  profile: User | null
  isLoading: boolean
  error: string | null
  fetchProfile: () => Promise<void>
  updateProfile: (data: ProfileUpdateData) => Promise<void>
  clearError: () => void
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const profile = await apiClient.getProfile()
      set({ profile, isLoading: false })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch profile"
      set({ error: errorMessage, isLoading: false })
    }
  },

  updateProfile: async (data: ProfileUpdateData) => {
    set({ isLoading: true, error: null })
    try {
      const formData = new FormData()

      if (data.name) formData.append("name", data.name)
      if (data.phone) formData.append("phone", data.phone)
      if (data.preferredLanguage) formData.append("preferredLanguage", data.preferredLanguage)
      if (data.profilePhoto) formData.append("profilePhoto", data.profilePhoto)

      const updatedProfile = await apiClient.updateProfile(formData)
      set({ profile: updatedProfile, isLoading: false })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update profile"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  clearError: () => set({ error: null }),
}))
