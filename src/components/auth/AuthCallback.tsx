import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/lib/auth-store'
import { toast } from 'sonner'

export const AuthCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setTokenAndFetchUser, isLoading, error } = useAuthStore()

  useEffect(() => {
    (async () => {
      const tokenFromQuery = searchParams.get('token')
      const existingToken = localStorage.getItem('access_token')

      const tokenToUse = tokenFromQuery ?? existingToken

      if (!tokenToUse) {
        toast.error('No authentication token found.')
        navigate('/login', { replace: true })
        return
      }

      try {
        const user = await setTokenAndFetchUser(tokenToUse)

        // Remove token from URL for cleanliness and security
        // Replace the current history entry so token isn't in history stack
        try {
          const cleanPath = window.location.pathname // keeps /auth/callback path
          const newUrl = cleanPath // we will perform a hard redirect below
          window.history.replaceState({}, document.title, newUrl)
        } catch (e) {
          // ignore replaceState errors
        }

        // Determine destination based on role and env vars
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

        if (!redirectBaseUrl) {
          toast.error(`Redirect URL not configured for role: ${user.role}`)
          navigate('/login', { replace: true })
          return
        }

        const cleanBase = redirectBaseUrl.trim().replace(/\/+$/,'')
        const encodedToken = encodeURIComponent(tokenToUse)
        const externalCallbackUrl = `${cleanBase}/auth/callback?token=${encodedToken}`

        // Hard redirect to the appropriate microfrontend
        window.location.href = externalCallbackUrl
        return
      } catch (err) {
        console.error('Error processing token in callback:', err)
        toast.error(error || 'Failed to process login token.')
        navigate('/login', { replace: true })
      }
    })()
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

export default AuthCallback

