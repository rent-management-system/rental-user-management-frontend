"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/lib/auth-store"
import { toast } from "sonner"
import logo from "/W.jpg"
import { useTranslation } from "react-i18next"
import { Eye, EyeOff } from "lucide-react"


export default function LoginForm() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const navigate = useNavigate()
  const { login, googleAuth } = useAuthStore()
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    if (!formData.email) newErrors.email = t("auth.invalidEmail")
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t("auth.invalidEmail")
    if (!formData.password) newErrors.password = t("auth.passwordRequired")
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
      toast.success(t("auth.loginSuccess"))

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
      let errorMessage = t("auth.loginFailedGeneric")
      if (error.response && error.response.status === 401) {
        errorMessage = t("auth.incorrectCredentials")
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
      toast.success(t("auth.loginSuccessGoogle"))
      navigate("/")
    } catch (error: any) {
      console.error("Google login error:", error)
      toast.error(error.message || t("auth.loginFailedGoogle"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex w-full max-w-5xl bg-white rounded-lg shadow-md overflow-hidden">
        {/* Left side - Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t("auth.welcomeBack")}</h2>
          <p className="text-gray-600 mb-8">{t("signInToAccount")}</p>

          {errors.general && (
            <div className="p-3 mb-4 bg-red-50 rounded-md border-l-4 border-red-500">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t("auth.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 text-black 
                ${errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-400"}`}
                placeholder="your-company@email.com"
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t("auth.password")}
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 text-black 
                ${errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-400"}`}
                placeholder="••••••••"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 focus:outline-none focus:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-black text-black font-medium rounded-md hover:bg-gray-800 transition disabled:opacity-70"
            >
              {isLoading ? t("auth.signingIn") : t("auth.login")}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {t("auth.orContinueWith")}
          </div>

          <div className="mt-3">
            <button
              onClick={handleGoogleSuccess}
              type="button"
              className="w-full flex items-center justify-center py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition text-black"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
              </svg>
              {t("auth.signInWithGoogle")}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t("auth.dontHaveAccount")}{" "}
            <Link to="/signup" className="font-medium text-black hover:underline">
              {t("auth.signup")}
            </Link>
          </p>
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