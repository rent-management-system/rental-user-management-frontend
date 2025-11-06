import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuthStore } from "@/lib/auth-store"
import { toast } from "sonner"
import { Toaster } from "sonner"

type FormData = {
  full_name: string
  email: string
  password: string
  confirmPassword: string
  phone_number: string
  role: 'tenant' | 'owner' | 'admin'
  preferred_language: string
  preferred_currency: string
}

export const SignupForm = () => {
  const navigate = useNavigate()
  const { register } = useAuthStore()
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone_number: "",
    role: "tenant",
    preferred_language: "en",
    preferred_currency: "ETB"
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    full_name?: string
    email?: string
    password?: string
    confirmPassword?: string
    phone_number?: string
    preferred_language?: string
    preferred_currency?: string
    general?: string
  }>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.phone_number) {
      newErrors.phone_number = 'Phone number is required'
    } else if (!/^\+251[79]\d{8}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Phone number must be in the format +2517XXXXXXXX or +2519XXXXXXXX'
    }

    if (!formData.preferred_language) {
      newErrors.preferred_language = 'Preferred language is required'
    }

    if (!formData.preferred_currency) {
      newErrors.preferred_currency = 'Preferred currency is required'
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
      
      
      // Call signup with all required parameters
      const result = await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        role: formData.role,
        preferred_language: formData.preferred_language,
        preferred_currency: formData.preferred_currency,
      })

      console.log('register result:', result)
      
      // Show success message
      toast.success('Account created successfully!', {
        description: 'You will be redirected to login page.',
        duration: 2000,
      })
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (error: any) {
      console.error('Signup error:', error)

      // Show backend or JS error messages. Support string, newline-separated strings, or array messages.
      const backendMessage = error?.response?.data?.message || error?.message
      if (typeof backendMessage === 'string') {
        toast.error('Error', {
          description: backendMessage,
          duration: 5000,
        })
      } else if (Array.isArray(backendMessage)) {
        backendMessage.forEach((msg) => {
          toast.error('Error', {
            description: msg,
            duration: 5000,
          })
        })
      }
      
      // Handle field-specific errors if they exist in the error object
      if (error.response?.data?.errors) {
        setErrors(prev => ({
          ...prev,
          ...error.response.data.errors
        }))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-center" />
     

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 font-['MBCorpo_Title',sans-serif]">Create an account</h2>
            <p className="mt-2 text-gray-600">Start your rental journey with us</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <p className="text-red-700">{errors.general}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.full_name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="John Doe"
                />
                {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  required
                  value={formData.phone_number}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.phone_number ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="+251 9XX XXX XXXX"
                />
                {errors.phone_number && <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    I am a
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="tenant">Tenant</option>
                    <option value="owner">Landlord</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="preferred_currency" className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    id="preferred_currency"
                    name="preferred_currency"
                    value={formData.preferred_currency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="ETB">ETB</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="preferred_language" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Language
                </label>
                <select
                  id="preferred_language"
                  name="preferred_language"
                  value={formData.preferred_language}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="en">English</option>
                  <option value="am">አማርኛ</option>
                  <option value="om">Oromiffa</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-70 transition-colors"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                </svg>
                Sign up with Google
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
