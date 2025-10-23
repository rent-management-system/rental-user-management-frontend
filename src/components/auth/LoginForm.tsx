"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import type { LoginCredentials } from "@/types"
import { validateEmail, validatePassword } from "@/lib/validation"
import toast from "react-hot-toast"
import { GoogleLogin } from "@react-oauth/google"

export const LoginForm = () => {
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuth()
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }
    if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await login(formData.email, formData.password)
      toast.success("Login successful!")
      navigate("/dashboard")
    } catch (err) {
      toast.error(error || "Login failed")
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await login(credentialResponse.credential)
      toast.success("Google login successful!")
      navigate("/dashboard")
    } catch (err) {
      toast.error("Google login failed")
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 card">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Login</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="input-base"
            disabled={isLoading}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="input-base"
            disabled={isLoading}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-50">
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="my-4 flex items-center gap-2">
        <div className="flex-1 h-px bg-border"></div>
        <span className="text-sm text-muted-foreground">Or</span>
        <div className="flex-1 h-px bg-border"></div>
      </div>

      <div className="flex justify-center">
        <GoogleLogin onSuccess={handleGoogleSuccess} />
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Don't have an account?{" "}
        <a href="/signup" className="text-primary hover:underline">
          Sign up
        </a>
      </p>
    </div>
  )
}
