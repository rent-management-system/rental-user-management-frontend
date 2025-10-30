import { create } from "zustand"
import { apiClient } from "./api-client"

// Define the User interface locally since we're not importing it
interface User {
  id: string;
  email: string;
  full_name: string;
  name?: string;
  phone_number?: string | null;
  phone?: string;
  role: 'tenant' | 'landlord' | 'admin';
  profile_photo?: string;
  profilePhoto?: string;
  preferred_language: 'en' | 'am' | 'om';
  preferredLanguage?: 'en' | 'am' | 'om';
  preferred_currency?: 'ETB' | 'USD';
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Define the ProfileUpdateData interface
interface ProfileUpdateData {
  name?: string;
  full_name?: string;
  phone?: string;
  phone_number?: string | null;
  preferred_language?: 'en' | 'am' | 'om';
  preferredLanguage?: 'en' | 'am' | 'om';
  profile_photo?: string | File;
  profilePhoto?: string | File;
  preferred_currency?: 'ETB' | 'USD';
}

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
