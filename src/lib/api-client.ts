import axios, { type AxiosInstance, type AxiosError } from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://rent-managment-system-user-magt.onrender.com"

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    })

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem("auth_token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Add response interceptor for better error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          console.error('API Error:', {
            status: error.response.status,
            data: error.response.data,
            url: error.config?.url
          })
        }
        return Promise.reject(error)
      }
    )
  }

  private async tryEndpoints<T>(endpoints: string[], data: any): Promise<T> {
    let lastError: any = null
    
    for (const endpoint of endpoints) {
      try {
        const response = await this.client.post(endpoint, data)
        console.log(`Success with endpoint: ${endpoint}`)
        return response.data
      } catch (error: any) {
        lastError = error
        console.log(`Tried ${endpoint}, got:`, error.response?.status || error.message)
        
        // If we get a 404, try the next endpoint
        if (error.response?.status !== 404) {
          throw error
        }
      }
    }
    
    throw lastError || new Error('All endpoints failed')
  }

  async login(email: string, password: string) {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', email);
    params.append('password', password);
    params.append('scope', '');
    params.append('client_id', 'web-client');
    params.append('client_secret', 'web-secret');

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    try {
      const response = await this.client.post('/auth/login', params.toString(), config);
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  }

  async signup(name: string, email: string, password: string, phone: string, role: string) {
    try {
      const response = await this.client.post('/users/register', {
        name,
        email,
        phone,
        password,
        role: role.toLowerCase(), // Ensure role is lowercase to match backend expectations
      })
      return response.data
    } catch (error: any) {
      console.error('Signup error:', error.response?.data || error.message)
      throw error
    }
  }

  async googleAuth(token: string) {
    const endpoints = [
      '/auth/google',
      '/api/auth/google',
      '/api/v1/auth/google',
      '/auth/google/callback',
      '/api/auth/google/callback'
    ]
    
    return this.tryEndpoints(endpoints, { token })
  }

  async forgotPassword(email: string) {
    const endpoints = [
      '/auth/forgot-password',
      '/api/auth/forgot-password',
      '/api/v1/auth/forgot-password',
      '/users/forgot-password',
      '/api/users/forgot-password'
    ]
    
    return this.tryEndpoints(endpoints, { email })
  }

  async resetPassword(token: string, password: string) {
    const endpoints = [
      '/auth/reset-password',
      '/api/auth/reset-password',
      '/api/v1/auth/reset-password'
    ]
    
    return this.tryEndpoints(endpoints, { token, password })
  }

  async getProfile() {
    const endpoints = [
      '/user/profile',
      '/api/user/profile',
      '/api/v1/user/profile',
      '/users/me',
      '/api/users/me',
      '/api/v1/users/me'
    ]
    
    try {
      // Try GET requests for profile
      for (const endpoint of endpoints) {
        try {
          const response = await this.client.get(endpoint)
          return response.data
        } catch (error: any) {
          if (error.response?.status !== 404) throw error
        }
      }
      throw new Error('No working profile endpoint found')
    } catch (error) {
      console.error('Profile fetch error:', error)
      throw error
    }
  }

  async updateProfile(data: FormData) {
    const endpoints = [
      '/user/profile',
      '/api/user/profile',
      '/api/v1/user/profile'
    ]
    
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
    
    try {
      for (const endpoint of endpoints) {
        try {
          const response = await this.client.put(endpoint, data, config)
          return response.data
        } catch (error: any) {
          if (error.response?.status !== 404) throw error
        }
      }
      throw new Error('No working profile update endpoint found')
    } catch (error) {
      console.error('Profile update error:', error)
      throw error
    }
  }
}

export const apiClient = new ApiClient()