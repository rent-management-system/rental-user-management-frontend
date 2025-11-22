"use client"

import type React from "react"
import { useEffect } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

type UserRole = "tenant" | "landlord" | "admin"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export const ProtectedRoute = ({ children: _children, requiredRole: _requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading, token } = useAuth()

  // Avoid redirects while auth state is hydrating
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // When authenticated, redirect directly to external microfrontend based on role
  useEffect(() => {
    if (!isAuthenticated || !user?.role) return

    let redirectBaseUrl = ''
    switch (user.role) {
      case 'admin':
        redirectBaseUrl = (import.meta.env.VITE_ADMIN_MICROFRONTEND_URL as string) || ''
        break
      case 'landlord':
        redirectBaseUrl = (import.meta.env.VITE_LANDLORD_MICROFRONTEND_URL as string) || ''
        break
      case 'tenant':
        redirectBaseUrl = (import.meta.env.VITE_TENANT_MICROFRONTEND_URL as string) || ''
        break
      default:
        redirectBaseUrl = ''
    }

    if (!redirectBaseUrl) return

    const cleanBase = redirectBaseUrl.trim().replace(/\/+$/,'')
    const encodedToken = encodeURIComponent(token || localStorage.getItem('access_token') || '')
    const externalCallbackUrl = `${cleanBase}/auth/callback?token=${encodedToken}`

    // Hard redirect
    window.location.href = externalCallbackUrl
  }, [isAuthenticated, user?.role, token])

  // While the hard redirect happens, render nothing to avoid internal page flash
  return <></>
}
