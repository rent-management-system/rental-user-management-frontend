"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordForm() {
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({})
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // The user is in the password recovery flow
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {}
    if (!formData.password) {
      newErrors.password = "Password is required."
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long."
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match."
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    setErrors({})
    try {
      const { error } = await supabase.auth.updateUser({ password: formData.password })

      if (error) {
        throw error
      }

      toast.success("Password has been reset successfully.")
      navigate("/login")
    } catch (error: any) {
      console.error("Reset password error:", error)
      toast.error(error.message || "Failed to reset password. The link may be invalid or expired.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-900">Reset Your Password</h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* New Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-400"
              }`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
          </div>

          {/* Confirm New Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-400"
              }`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition disabled:opacity-70"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  )
}
