import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuthStore } from "@/lib/auth-store"
import { toast } from "sonner"

export const AuthCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setTokenAndFetchUser, isLoading, error } = useAuthStore()

  useEffect(() => {
    const token = searchParams.get("token")
    const existingToken = localStorage.getItem("access_token")

    if (token) {
      // Prefer token from URL
      setTokenAndFetchUser(token)
        .then(() => {
          // Remove token from URL and redirect to dashboard
          navigate("/dashboard", { replace: true })
          toast.success("Login successful!")
        })
        .catch((err) => {
          console.error("Error setting token and fetching user:", err)
          toast.error(error || "Failed to process login token.")
          navigate("/login", { replace: true })
        })
    } else if (existingToken) {
      // If no token in URL but one exists in localStorage, try to use it
      setTokenAndFetchUser(existingToken)
        .then(() => {
          navigate("/dashboard", { replace: true })
          toast.success("Already logged in!")
        })
        .catch((err) => {
          console.error("Error using existing token:", err)
          toast.error(error || "Session expired. Please log in again.")
          navigate("/login", { replace: true })
        })
    } else {
      // No token in URL or localStorage, redirect to login
      toast.error("No authentication token found.")
      navigate("/login", { replace: true })
    }
  }, [searchParams, navigate, setTokenAndFetchUser, error])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <div>Processing authentication...</div>
}
