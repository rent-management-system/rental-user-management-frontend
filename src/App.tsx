import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useTheme } from "@/hooks/useTheme"
import { ErrorBoundary } from "@/components/common/ErrorBoundary"
import { Toast } from "@/components/common/Toast"
import LoginForm from "@/components/auth/LoginForm"
import { SignupForm } from "@/components/auth/SignupForm"
import { AuthCallback } from "@/components/auth/AuthCallback"
import ForgotPassword from "@/components/auth/ForgotPassword"
import ResetPassword from "@/components/auth/ResetPassword"

export default function App() {
  const { theme } = useTheme()

  return (
    <ErrorBoundary>
      <Router>
        <Toast />
        <div className={theme === "dark" ? "dark" : ""}>
          <Routes>
            {/* Authentication Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  )
}