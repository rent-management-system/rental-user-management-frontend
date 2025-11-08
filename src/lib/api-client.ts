import axios from 'axios'

const baseURL = (import.meta.env.VITE_API_BASE_URL as string) || '/api/v1'

const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})

// Request interceptor: attach token from localStorage
apiClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('access_token')
    if (token && config && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (e) {
    // ignore
  }
  return config
})

// Response interceptor: handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      try {
        localStorage.removeItem('access_token')
      } catch (e) {}
      // redirect to login page (client-side)
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
