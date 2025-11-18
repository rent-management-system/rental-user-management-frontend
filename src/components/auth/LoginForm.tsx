

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/lib/auth-store"
import { toast } from "sonner"
import logo from "@/asset/W.jpg"
import { Eye, EyeOff } from "lucide-react"
import { GoogleLogin } from "@react-oauth/google"

export default function LoginForm() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const navigate = useNavigate()
  const { login, googleAuth } = useAuthStore()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    if (!formData.email) newErrors.email = "Invalid email address"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email address"
    if (!formData.password) newErrors.password = "You need a password to Login."
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    setErrors({})
    try {
      const user = await login(formData.email, formData.password)
      toast.success("Logged in successfully")

      let redirectBaseUrl: string | undefined

      switch (user.role) {
        case 'admin':
          redirectBaseUrl = import.meta.env.VITE_ADMIN_MICROFRONTEND_URL
          break
        case 'landlord':
        case 'owner': // Assuming 'owner' role should redirect to landlord microfrontend
          redirectBaseUrl = import.meta.env.VITE_LANDLORD_MICROFRONTEND_URL
          break
        case 'tenant':
          redirectBaseUrl = import.meta.env.VITE_TENANT_MICROFRONTEND_URL
          break
        default:
          redirectBaseUrl = undefined
      }

      const { token } = useAuthStore.getState()

      console.log("User role:", user.role)
      console.log("Redirect base URL:", redirectBaseUrl)
      console.log("Token present:", !!token)

      if (redirectBaseUrl && token) {
        window.location.href = `${redirectBaseUrl.trim()}/auth/callback#access_token=${token}`
      } else {
        navigate("/")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      let errorMessage = "Login failed. Please check your credentials and try again."
      if (error.response && error.response.status === 401) {
        errorMessage = "Incorrect email or password. Please try again."
      } else if (error.message) {
        errorMessage = error.message
      }
      setErrors({
        general: errorMessage,
      })
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true)
      await googleAuth(credentialResponse.credential || "")
      toast.success("Logged in with Google successfully")
      navigate("/")
    } catch (error: any) {
      console.error("Google login error:", error)
      toast.error(error.message || "Google login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToMainPage = () => {
    window.location.href = "https://rent-management-system-tau.vercel.app/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex w-full max-w-5xl bg-white rounded-lg shadow-md overflow-hidden">
        {/* Left side - Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600 mb-8">Sign in to your account</p>

          {errors.general && (
            <div className="p-3 mb-4 bg-red-50 rounded-md border-l-4 border-red-500">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Emaillogo
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 
                ${errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-400"}`}
                placeholder="your-company@email.com"
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 
                ${
                  errors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-gray-400"
                }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password}</p>
              )}
              <div className="text-sm text-right mt-2">
                <Link to="/forgot-password" className="font-medium text-orange-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Or continue with
          </div>

          <div className="mt-3">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                toast.error("Google login failed. Please try again.");
              }}
            />
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link to="/signup" className="font-medium text-orange-600 hover:underline">
              Sign up
            </Link>
          </p>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleBackToMainPage}
              className="font-medium text-blue-600 hover:underline"
            >
              Back to Main Page
            </button>
          </div>
        </div>

        {/* Right side - Logo and text */}
        <div className="hidden md:flex w-1/2 bg-white border-l border-gray-200 items-center justify-center flex-col p-10">
          <img src={logo} alt="tesfa.ai logo" className="w-45 h45 mb-4" />
          <h1 className="text-3xl font-semibold text-gray-800">
          </h1>
          
        </div>
      </div>
    </div>
  )
}