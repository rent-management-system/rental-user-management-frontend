

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/hooks/useTheme"
import { ErrorBoundary } from "@/components/common/ErrorBoundary"
import { Toast } from "@/components/common/Toast"
import { Header } from "@/components/layout/Header"
import { Sidebar } from "@/components/layout/Sidebar"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import LoginForm from "@/components/auth/LoginForm"
import { SignupForm } from "@/components/auth/SignupForm"
import { AuthCallback } from "@/components/auth/AuthCallback"
import { Dashboard } from "@/pages/Dashboard"
import { ProfileEditor } from "@/components/profile/ProfileEditor"
import { ProfileView } from "@/components/profile/ProfileView"
import ForgotPassword from "@/components/auth/ForgotPassword"
import ResetPassword from "@/components/auth/ResetPassword"

export default function App() {
  const { isAuthenticated } = useAuth()
  const { theme } = useTheme()

  return (
    <ErrorBoundary>
      <Router>
        <Toast />
        <div className={theme === "dark" ? "dark" : ""}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginForm />} />
            <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignupForm />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-background">
                    <Sidebar />
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <Header />
                      <main className="flex-1 overflow-auto">
                        <Routes>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/profile" element={<ProfileView />} />
                          <Route path="/profile/edit" element={<ProfileEditor />} />
                          <Route path="*" element={<Navigate to="/dashboard" />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  )
}
