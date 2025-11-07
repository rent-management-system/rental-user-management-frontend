"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      const successMessage = "If an account with that email exists, a password reset link has been sent."
      setMessage(successMessage)
      toast.success(successMessage)
    } catch (error: any) {
      console.error("Forgot password error:", error)
      toast.error(error.message || "Failed to send password reset link.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-900">Forgot Your Password?</h2>
        <p className="text-center text-gray-600">
          Enter your email address and we will send you a link to reset your password.
        </p>

        {message && (
          <div className="p-3 bg-green-50 rounded-md border-l-4 border-green-500">
            <p className="text-green-600 text-sm">{message}</p>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 border-gray-300 focus:ring-gray-400"
              placeholder="your-email@example.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition disabled:opacity-70"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link to="/login" className="font-medium text-orange-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
