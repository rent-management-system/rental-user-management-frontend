"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import type { SignupCredentials, UserRole } from "@/types"
import { validateEmail, validatePassword } from "@/lib/validation"
import toast from "react-hot-toast"
import { AuthLayout } from "./AuthLayout"

// Default admin credentials (in a real app, these would be in environment variables)
const DEFAULT_ADMIN = {
  email: 'admin@rental.com',
  password: 'admin123',
  name: 'Administrator'
};

export const SignupForm = () => {
  const navigate = useNavigate()
  const { signup, isLoading, error } = useAuth()
  const [formData, setFormData] = useState<SignupCredentials>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "tenant", // Default to tenant, admin is a special case
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleRoleChange = (role: string) => {
    const newRole = role as UserRole;
    setFormData(prev => ({
      ...prev,
      role: newRole,
      name: newRole === 'admin' ? '' : prev.name,
      email: newRole === 'admin' ? '' : prev.email,
      password: newRole === 'admin' ? '' : prev.password
    }));  
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'role') {
      handleRoleChange(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  const validateForm = (data: SignupCredentials = formData) => {
    const newErrors: Record<string, string> = {}

    if (data.role === 'admin') {
      // No validation needed for admin as we use fixed credentials
      return true;
    }

    // Regular validation for other roles
    if (!data.name.trim()) {
      newErrors.name = "Name is required"
    }
    if (!validateEmail(data.email)) {
      newErrors.email = "Please enter a valid email"
    }
    if (!data.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^\+?[0-9\s-]{10,}$/.test(data.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }
    if (!validatePassword(data.password)) {
      newErrors.password = "Password must be at least 6 characters"
    }
    if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return;

    try {
      // For admin role, verify the credentials match the default admin
      if (formData.role === 'admin') {
        if (formData.email !== DEFAULT_ADMIN.email || formData.password !== DEFAULT_ADMIN.password) {
          toast.error("Invalid admin credentials");
          return;
        }
      }

      await signup(
        formData.role === 'admin' ? DEFAULT_ADMIN.name : formData.name,
        formData.role === 'admin' ? DEFAULT_ADMIN.email : formData.email,
        formData.role === 'admin' ? DEFAULT_ADMIN.password : formData.password,
        formData.phone,
        formData.role
      );
      
      // Show success message
      toast.success("🎉 Registration successful! You can now log in.", {
        duration: 4000,
        position: 'top-center',
        icon: '✅',
        style: {
          background: '#10B981',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      console.error('Signup error:', err);
      
      // Handle specific error cases
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage = err.response.data?.detail || 
                           err.response.data?.message || 
                           'Signup failed. Please try again.';
        toast.error(errorMessage);
        
        // Handle field-specific errors
        if (err.response.data?.errors) {
          const fieldErrors = err.response.data.errors;
          setErrors(prev => ({
            ...prev,
            ...fieldErrors
          }));
        }
      } else if (err.request) {
        // The request was made but no response was received
        toast.error("Cannot connect to the server. Please check your connection.");
      } else {
        // Something happened in setting up the request
        toast.error(err.message || "An unexpected error occurred");
      }
    }
  }

  return (
    <AuthLayout 
      title="Create Your Account"
      subtitle="Join our community and get started in seconds"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
          {formData.role === 'admin' && (
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/10 border border-indigo-100 dark:border-indigo-800/50 rounded-xl mb-4 transform transition-all duration-200 hover:shadow-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-200 mb-1">Admin Authentication Required</h4>
                  <p className="text-xs text-indigo-700/90 dark:text-indigo-300/90">
                    Please enter the admin credentials to create an admin account.
                  </p>
                </div>
              </div>
            </div>
          )}

          {formData.role === 'admin' ? (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-base ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter admin email"
                  required
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                  Admin Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-base ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                  required
                />
                {formData.password.length > 0 && formData.password !== DEFAULT_ADMIN.password && (
                  <p className="text-xs text-amber-500 mt-1">
                    Incorrect admin credentials
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input-base ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="John Doe"
                  required
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-base ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="you@example.com"
                  required
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`input-base ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="+251 911 123456"
                  required
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-base ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                {formData.password.length > 0 && formData.password.length < 6 && (
                  <p className="text-xs text-amber-500 mt-1">
                    Password must be at least 6 characters
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-base ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </>
          )}
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            I am a
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'admin', label: 'Administrator', description: 'Full system access', icon: '🛡️' },
              { value: 'landlord', label: 'Landlord', description: 'Manage properties', icon: '🏠' },
              { value: 'tenant', label: 'Tenant', description: 'Find a place', icon: '👤' },
              { value: 'broker', label: 'Broker', description: 'Connect tenants & landlords', icon: '🤝' },
            ].map((role) => (
              <label 
                key={role.value}
                className={`flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  formData.role === role.value 
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 shadow-md scale-[1.02]' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={formData.role === role.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="text-3xl mb-2 text-indigo-600 dark:text-indigo-400">{role.icon}</div>
                <div className="text-center">
                  <div className="text-gray-900 dark:text-white font-medium text-sm">{role.label}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{role.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-200 ${
            isLoading 
              ? 'bg-indigo-600/80 cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-600/90 hover:to-blue-500/90 hover:shadow-lg transform hover:-translate-y-0.5 shadow-md shadow-indigo-500/20'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </>
          ) : 'Create Account'}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs">
              OR CONTINUE WITH
            </span>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500/50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
