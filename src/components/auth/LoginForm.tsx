"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/lib/auth-store"
import { toast } from "sonner"
import logo from "@/asset/W.jpg"
import { useTranslation } from "react-i18next"

export default function LoginForm() {
  const { t, i18n } = useTranslation()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false) // New state for password visibility
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const navigate = useNavigate()
  const { login, googleAuth } = useAuthStore()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    if (!formData.email) newErrors.email = t("validation.emailRequired")
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t("validation.emailInvalid")
    if (!formData.password) newErrors.password = t("validation.passwordRequiredLogin")
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
      toast.success(t("toast.loggedInSuccessfully"))

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
      let errorMessage = t("error.loginFailedGeneral")
      if (error.response && error.response.status === 401) {
        errorMessage = t("error.incorrectCredentials")
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
      toast.success(t("toast.loggedInGoogle"))
      navigate("/")
    } catch (error: any) {
      console.error("Google login error:", error)
      toast.error(error.message || t("error.googleLoginFailed"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex w-full max-w-5xl bg-white rounded-lg shadow-md overflow-hidden">
        {/* Left side - Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <div className="flex justify-end mb-4">
            <select
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
              className="px-2 py-1 border rounded-md"
            >
              <option value="en">English</option>
              <option value="am">Amharic</option>
              <option value="om">Afaan Oromo</option>
            </select>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t("loginForm.welcomeBack")}</h2>
          <p className="text-gray-600 mb-8">{t("loginForm.signInAccount")}</p>

          {errors.general && (
            <div className="p-3 mb-4 bg-red-50 rounded-md border-l-4 border-red-500">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t("loginForm.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 
                ${errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-400"}`}
                placeholder={t("loginForm.emailPlaceholder")}
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t("loginForm.password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 pr-10
                  ${errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-400"}`}
                  placeholder={t("loginForm.passwordPlaceholder")}
                />
                {/* Eye icon button */}
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    // Eye open icon (visible password)
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    // Eye closed icon (hidden password)
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
              <div className="text-right text-sm mt-1">
                <Link to="/forgot-password" className="font-medium text-orange-600 hover:underline">
                  {t("loginForm.forgotPassword")}
                </Link>
              </div>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition disabled:opacity-70"
            >
              {isLoading ? t("loginForm.signingIn") : t("loginForm.signIn")}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {t("loginForm.orContinueWith")}
          </div>

          <div className="mt-3">
            <button
              onClick={handleGoogleSuccess}
              type="button"
              className="w-full flex items-center justify-center py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
              </svg>
              {t("loginForm.signInWithGoogle")}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t("loginForm.noAccount")}{" "}
            <Link to="/signup" className="font-medium text-orange-600 hover:underline">
              {t("loginForm.signUp")}
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