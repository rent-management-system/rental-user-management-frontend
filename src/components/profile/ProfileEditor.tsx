"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useProfile } from "@/hooks/useProfile"
import { useAuth } from "@/hooks/useAuth"
import type { ProfileUpdateData } from "@/types"
import toast from "react-hot-toast"

export const ProfileEditor = () => {
  const { user } = useAuth()
  const { profile, isLoading, error, updateProfile, clearError } = useProfile()
  const [formData, setFormData] = useState<ProfileUpdateData>({
    name: "",
    phone: "",
    preferredLanguage: "en",
  })
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        preferredLanguage: user.preferredLanguage || "en",
      })
      if (user.profilePhoto) {
        setPhotoPreview(user.profilePhoto)
      }
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    clearError()
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB")
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file")
        return
      }

      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const updateData: ProfileUpdateData = { ...formData }
      if (selectedFile) {
        updateData.profilePhoto = selectedFile
      }

      await updateProfile(updateData)
      toast.success("Profile updated successfully!")
      setSelectedFile(null)
    } catch (err) {
      toast.error(error || "Failed to update profile")
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 card">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Edit Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {photoPreview ? (
              <img src={photoPreview || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-muted-foreground">No photo</span>
            )}
          </div>
          <label className="cursor-pointer">
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" disabled={isLoading} />
            <span className="text-primary hover:underline">Change Photo</span>
          </label>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input-base"
            disabled={isLoading}
          />
        </div>

        {/* Email (Read-only) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={user?.email || ""}
            className="input-base opacity-50 cursor-not-allowed"
            disabled
          />
          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-2">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
            className="input-base"
            disabled={isLoading}
          />
        </div>

        {/* Preferred Language */}
        <div>
          <label htmlFor="language" className="block text-sm font-medium mb-2">
            Preferred Language
          </label>
          <select
            id="language"
            name="preferredLanguage"
            value={formData.preferredLanguage}
            onChange={handleChange}
            className="input-base"
            disabled={isLoading}
          >
            <option value="en">English</option>
            <option value="am">Amharic (አማርኛ)</option>
            <option value="om">Afaan Oromo</option>
          </select>
        </div>

        {/* Role (Read-only) */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium mb-2">
            Account Type
          </label>
          <input
            id="role"
            type="text"
            value={user?.role.charAt(0).toUpperCase() + user?.role.slice(1) || ""}
            className="input-base opacity-50 cursor-not-allowed"
            disabled
          />
          <p className="text-xs text-muted-foreground mt-1">Account type cannot be changed</p>
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-50">
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  )
}
