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

        // Remove token from URL for security
        try {
          const cleanPath = window.location.pathname
          window.history.replaceState({}, document.title, cleanPath)
        } catch (e) {
          // ignore replaceState errors
        }

        // Redirect to appropriate microfrontend based on user role
        let redirectUrl = ''
        switch (user.role) {
          case 'admin':
            redirectUrl = import.meta.env.VITE_ADMIN_MICROFRONTEND_URL
            break
          case 'landlord':
            redirectUrl = import.meta.env.VITE_LANDLORD_MICROFRONTEND_URL
            break
          case 'tenant':
            redirectUrl = import.meta.env.VITE_TENANT_MICROFRONTEND_URL
            break
          default:
            toast.error('Unknown user role')
            navigate('/login', { replace: true })
            return
        }

        if (!redirectUrl) {
          toast.error(`Redirect URL not configured for role: ${user.role}`)
          navigate('/login', { replace: true })
          return
        }

        // Clean URL and append token
        const cleanBase = redirectUrl.trim().replace(/\/+$/, '')
        const encodedToken = encodeURIComponent(tokenToUse)
        const finalUrl = `${cleanBase}?token=${encodedToken}`

        toast.success('Login successful! Redirecting...')
        
        // Redirect to microfrontend
        window.location.href = finalUrl
      } catch (err) {
        console.error('Error processing token in callback:', err)
        toast.error(error || 'Failed to process login token.')
        navigate('/login', { replace: true })
      }
    })()
  }, [searchParams, navigate, setTokenAndFetchUser, error])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing authentication...</p>
      </div>
    </div>
  )
}

export default AuthCallback
