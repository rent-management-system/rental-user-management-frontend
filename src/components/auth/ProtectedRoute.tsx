"use client"

import { ReactNode } from "react"
import { Navigate } from "react-router-dom"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: "admin" | "landlord" | "tenant"
}

// This component is no longer needed for authentication microservice
// All authenticated users are redirected to their respective microfrontends
// Keeping this for backward compatibility, but it just redirects to login
export const ProtectedRoute = (_props: ProtectedRouteProps) => {
  return <Navigate to="/login" replace />
}
