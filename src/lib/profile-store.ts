import { create } from "zustand"
import apiClient from "./api-client"
import { UserProfile } from "./types"

// Use shared UserProfile and extend for local conveniences
type User = UserProfile & {
  name?: string
  phone?: string
  profilePhoto?: string
  preferredLanguage?: 'en' | 'am' | 'om'
  createdAt?: string
  updatedAt?: string
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
  // allow passing FormData as well
  fetchProfile: () => Promise<void>
  updateProfile: (data: ProfileUpdateData | FormData) => Promise<void>
  clearError: () => void
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      // use axios get and read response.data
      const res = await apiClient.get('/profile/me')
      set({ profile: res.data, isLoading: false })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch profile"
      set({ error: errorMessage, isLoading: false })
    }
  },

  updateProfile: async (data: ProfileUpdateData | FormData) => {
    set({ isLoading: true, error: null })
    try {
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
            if (data.profile_photo && typeof data.profile_photo !== 'string') fd.append("profile_photo", data.profile_photo as File)
            if (data.profilePhoto && data.profilePhoto instanceof File) fd.append("profilePhoto", data.profilePhoto)
            if (data.preferred_currency) fd.append("preferred_currency", data.preferred_currency)
            return fd
          })()

      // use PUT (or POST depending on backend). Set multipart header so axios sends boundary correctly.
      const res = await apiClient.put('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      set({ profile: res.data, isLoading: false })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update profile"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  clearError: () => set({ error: null }),
}))
