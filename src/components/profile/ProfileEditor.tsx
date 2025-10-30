"use client"

import { useState, useEffect } from "react"
import { useProfile } from "@/hooks/useProfile"
import { useAuth } from "@/hooks/useAuth"
// Using global ProfileUpdateData type
import { toast } from "sonner"

export const ProfileEditor = () => {
  const { user } = useAuth()
  const { isLoading, updateProfile } = useProfile()
  const [formData, setFormData] = useState<{
    name: string
    full_name: string
    phone: string
    phone_number: string
    preferred_language: "en" | "am" | "om"
  }>({
    name: "",
    full_name: "",
    phone: "",
    phone_number: "",
    preferred_language: "en",
  })
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.full_name || "",
        full_name: user.full_name || "",
        phone: user.phone_number || "",
        phone_number: user.phone_number || "",
        preferred_language: (user.preferred_language as "en" | "am" | "om") || "en",
      })
      if (user.profile_photo) {
        setPhotoPreview(user.profile_photo)
      }
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type first
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    // Then validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setPhotoPreview(result)
      setSelectedFile(file)
    }
    reader.onerror = () => {
      toast.error("Failed to load image")
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const formDataToSend = new FormData()
      
      // Add all form data to FormData
      Object.entries({
        name: formData.name,
        full_name: formData.full_name,
        phone: formData.phone,
        phone_number: formData.phone_number,
        preferred_language: formData.preferred_language,
      }).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, value as string)
        }
      })
      
      // Add profile photo if selected
      if (selectedFile) {
        formDataToSend.append('profile_photo', selectedFile)
      }

      // Convert FormData to a plain object
      const formDataObj: Record<string, any> = {};
      formDataToSend.forEach((value, key) => {
        formDataObj[key] = value;
      });
      
      // Type assertion to the expected shape
      const profileData = {
        name: formDataObj.name || '',
        full_name: formDataObj.full_name || '',
        phone: formDataObj.phone || formDataObj.phone_number || '',
        phone_number: formDataObj.phone_number || formDataObj.phone || '',
        preferred_language: formDataObj.preferred_language || 'en',
        preferred_currency: formDataObj.preferred_currency || 'ETB',
        profile_photo: formDataObj.profile_photo
      };
      
      await updateProfile(profileData)
      toast.success("Profile updated successfully")
      setSelectedFile(null)
    } catch (err: any) {
      console.error('Profile update error:', err)
      toast.error("Error", {
        description: err?.response?.data?.message || err?.message || "Failed to update profile"
      })
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 card">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Edit Profile</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photo Upload */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
            {photoPreview ? (
              <img 
                src={photoPreview} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">No photo</span>
              </div>
            )}
          </div>
          <label className="cursor-pointer">
            <span className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
              {photoPreview ? 'Change Photo' : 'Upload Photo'}
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </label>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Preferred Language */}
        <div>
          <label htmlFor="preferred_language" className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Language
          </label>
          <select
            id="preferred_language"
            name="preferred_language"
            value={formData.preferred_language}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="en">English</option>
            <option value="am">አማርኛ</option>
            <option value="om">Oromiffa</option>
          </select>
        </div>


        {/* Submit Button */}
        <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-50">
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  )
}
