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

  updateProfile: async (data: ProfileUpdateData | FormData) => {
    set({ isLoading: true, error: null })
    try {
      // If data is already FormData, use it directly
      // Otherwise, create a new FormData and append the fields
      const formData = data instanceof FormData 
        ? data 
        : (() => {
            const fd = new FormData()
            if (data.name) fd.append("name", data.name)
            if (data.full_name) fd.append("full_name", data.full_name)
            if (data.phone) fd.append("phone", data.phone)
            if (data.phone_number) fd.append("phone_number", data.phone_number || '')
            if (data.preferred_language) fd.append("preferred_language", data.preferred_language)
            if (data.preferredLanguage) fd.append("preferredLanguage", data.preferredLanguage)
            if (data.profile_photo) fd.append("profile_photo", data.profile_photo)
            if (data.profilePhoto && data.profilePhoto instanceof File) fd.append("profilePhoto", data.profilePhoto)
            if (data.preferred_currency) fd.append("preferred_currency", data.preferred_currency)
            return fd
          })()

      const updatedProfile = await apiClient.updateProfile(formData as any)
      set({ profile: updatedProfile, isLoading: false })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update profile"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  clearError: () => set({ error: null }),
}))
