import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/hooks/useTheme"
import { ErrorBoundary } from "@/components/common/ErrorBoundary"
import { Toast } from "@/components/common/Toast"
import Header from "@/components/layout/Header"
import PublicHeader from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { Sidebar } from "@/components/layout/Sidebar"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

import LoginForm from "@/components/auth/LoginForm"
import { SignupForm } from "@/components/auth/SignupForm"
import { AuthCallback } from "@/components/auth/AuthCallback"

import { Dashboard } from "@/pages/Dashboard"
import { ProfileEditor } from "@/components/profile/ProfileEditor"
import { ProfileView } from "@/components/profile/ProfileView"


// ⭐ Your new Home page
import Home from "@/pages/Home"

export default function App() {
  const { isAuthenticated } = useAuth()
  const { theme } = useTheme()

  return (
    <ErrorBoundary>
      <Router>
        <Toast />

        <div className={theme === "dark" ? "dark" : ""}>

          <Routes>

            {/* ⭐ PUBLIC HOMEPAGE */}
            <Route path="/" element={
              <div className="bg-white">
                <PublicHeader />
                <Home />
                <Footer />
              </div>
            } />

            {/* ⭐ PUBLIC AUTH ROUTES */}
            <Route
              path="/login"
              element={
                <>
                  <PublicHeader />
                  {isAuthenticated ? <Navigate to="/dashboard" /> : <LoginForm />}
                  <Footer />
                </>
              }
            />
            <Route
              path="/signup"
              element={
                <>
                  <PublicHeader />
                  {isAuthenticated ? <Navigate to="/dashboard" /> : <SignupForm />}
                  <Footer />
                </>
              }
            />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* ⭐ PROTECTED DASHBOARD */}
            <Route
              path="/app/*"
              element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-background">
                    <Sidebar />

                    <div className="flex-1 flex flex-col overflow-hidden">
                      <Header />

                      <main className="flex-1 overflow-auto">
                        <Routes>
                          <Route path="dashboard" element={<Dashboard />} />
                          <Route path="profile" element={<ProfileView />} />
                          <Route path="profile/edit" element={<ProfileEditor />} />
                          <Route path="*" element={<Navigate to="dashboard" />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Catch-all → Homepage */}
            <Route path="*" element={<Navigate to="/" />} />

          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  )
}
