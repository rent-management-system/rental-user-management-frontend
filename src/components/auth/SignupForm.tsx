"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import type { SignupCredentials, UserRole } from "@/types"
import { validateEmail, validatePassword } from "@/lib/validation"
import toast from "react-hot-toast"

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
    password: "",
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
    if (!validatePassword(data.password)) {
      newErrors.password = "Password must be at least 6 characters"
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
        formData.role
      );
      toast.success("Signup successful!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(error || "Signup failed");
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-card rounded-xl shadow-md overflow-hidden p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Create Your Account</h1>
        <p className="text-muted-foreground">Join thousands of users in our community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          {formData.role === 'admin' && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Admin Authentication Required</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Please enter the admin credentials to create an admin account.
              </p>
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
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                {formData.password.length > 0 && formData.password.length < 6 && (
                  <p className="text-xs text-amber-500 mt-1">
                    Password must be at least 6 characters
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            I am a
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'admin', label: 'Administrator', description: 'Full system access' },
              { value: 'landlord', label: 'Landlord', description: 'Manage properties' },
              { value: 'tenant', label: 'Tenant', description: 'Find a place' },
              { value: 'broker', label: 'Broker', description: 'Connect tenants & landlords' },
            ].map((role) => (
              <label 
                key={role.value}
                className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.role === role.value 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/30'
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
                <div className="text-center">
                  <div className="text-foreground font-medium">{role.label}</div>
                  <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full py-3 mt-4 text-base font-medium"
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

      {formData.role !== 'admin' && (
        <>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">
                Or sign up with
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <button
              type="button"
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
        </>
      )}
      
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>

      <p className="mt-4 text-xs text-center text-muted-foreground">
        By signing up, you agree to our{' '}
        <a href="#" className="underline hover:text-primary">Terms of Service</a> and{' '}
        <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
      </p>
    </div>
  )
}
