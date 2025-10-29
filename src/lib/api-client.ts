import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://rent-managment-system-user-magt.onrender.com"

class ApiClient {
  private client: AxiosInstance
  private isRefreshing = false
  private refreshSubscribers: ((token: string) => void)[] = []

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Add response interceptor for token refresh and error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
        
        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If token refresh is in progress, wait for it to complete
            return new Promise((resolve, reject) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`
                resolve(this.client(originalRequest))
              })
            })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const refreshToken = localStorage.getItem('refresh_token')
            if (!refreshToken) {
              this.clearAuth()
              return Promise.reject(error)
            }

            // Try to refresh the token
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
              params: { refresh_token: refreshToken }
            })
            
            const { access_token, refresh_token } = response.data
            this.setAuthTokens(access_token, refresh_token)
            
            // Update the Authorization header and retry the original request
            originalRequest.headers.Authorization = `Bearer ${access_token}`
            
            // Process all pending requests
            this.processSubscribers(access_token)
            
            return this.client(originalRequest)
          } catch (refreshError) {
            // If refresh fails, clear auth and redirect to login
            this.clearAuth()
            window.location.href = '/login'
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }
        
        // Log error for debugging
        if (error.response) {
          console.error('API Error:', {
            status: error.response.status,
            data: error.response.data,
            url: originalRequest.url
          })
        }
        
        return Promise.reject(error)
      }
    )
  }

  private setAuthTokens(accessToken: string, refreshToken?: string) {
    localStorage.setItem('access_token', accessToken)
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken)
    }
  }

  private clearAuth() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  private processSubscribers(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token))
    this.refreshSubscribers = []
  }

  async login(email: string, password: string) {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)
    
    try {
      const response = await this.client.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      
      const { access_token, refresh_token } = response.data
      this.setAuthTokens(access_token, refresh_token)
      
      // Get user data
      const userResponse = await this.client.get('/users/me')
      return { user: userResponse.data, token: access_token }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.'
      throw new Error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage)
    }
  }

  async signup(
    full_name: string, 
    email: string, 
    password: string, 
    phone_number: string, 
    role: string,
    preferred_language: string = 'en',
    preferred_currency: string = 'ETB'
  ) {
    try {
      const requestData = {
        full_name,
        email,
        password,
        phone_number: phone_number || undefined,
        role: role.toLowerCase(),
        preferred_language,
        preferred_currency
      };
      
      console.log('Sending signup request with data:', JSON.stringify(requestData, null, 2));
      
      const response = await this.client.post('/users/register', requestData);
      
      console.log('Signup successful, response:', response.data);
      
      // Auto-login after successful signup
      return this.login(email, password);
    } catch (error: any) {
      console.error('Signup error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
          headers: error.config?.headers
        }
      });
      console.error('Signup error:', error);
      
      // Handle 422 validation errors
      if (error.response?.status === 422 && error.response?.data?.detail) {
        // If it's an array of validation errors
        if (Array.isArray(error.response.data.detail)) {
          const errorMessages = error.response.data.detail.map((err: any) => 
            `${err.loc ? err.loc[err.loc.length - 1] + ': ' : ''}${err.msg}`
          );
          throw new Error(errorMessages.join('\n'));
        }
        // If it's a single error message
        throw new Error(error.response.data.detail);
      }
      
      // Handle other types of errors
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Signup failed. Please try again.';
      
      throw new Error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    }
  }

  async googleAuth(token: string) {
    try {
      // First try the standard OAuth2 token endpoint
      const formData = new URLSearchParams()
      formData.append('grant_type', 'google')
      formData.append('token', token)
      
      const response = await this.client.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      
      const { access_token, refresh_token } = response.data
      this.setAuthTokens(access_token, refresh_token)
      
      // Get user data
      const userResponse = await this.client.get('/users/me')
      return { user: userResponse.data, token: access_token }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Google authentication failed.'
      throw new Error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage)
    }
  }

  async forgotPassword(email: string) {
    try {
      // Note: This endpoint might need to be adjusted based on your backend
      await this.client.post('/auth/forgot-password', { email })
      return { success: true, message: 'Password reset email sent' }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to send password reset email.'
      throw new Error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage)
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      // Note: This endpoint might need to be adjusted based on your backend
      await this.client.post('/auth/reset-password', {
        token,
        new_password: newPassword
      })
      return { success: true, message: 'Password has been reset successfully' }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to reset password.'
      throw new Error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage)
    }
  }

  async getProfile() {
    try {
      const response = await this.client.get('/users/me')
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch user profile.'
      throw new Error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage)
    }
  }

  async updateProfile(profileData: {
    full_name?: string;
    phone_number?: string | null;
    preferred_language?: 'en' | 'am' | 'om';
    preferred_currency?: 'ETB' | 'USD';
  }) {
    try {
      const response = await this.client.put('/users/me', profileData)
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to update profile.'
      throw new Error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage)
    }
  }

  async changePassword(oldPassword: string, newPassword: string) {
    try {
      await this.client.post('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword
      })
      return { success: true, message: 'Password changed successfully' }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to change password.'
      throw new Error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage)
    }
  }
}

export const apiClient = new ApiClient()