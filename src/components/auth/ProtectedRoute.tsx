"use client"

import type React from "react"

import { Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import type { UserRole } from "@/types"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
