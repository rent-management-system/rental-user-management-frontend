import axios, { 
  AxiosInstance, 
  AxiosError, 
  AxiosRequestConfig, 
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://rent-managment-system-user-magt.onrender.com";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  role: string;
  is_active: boolean;
  preferred_language: 'en' | 'am' | 'om';
  preferred_currency: 'ETB' | 'USD';
  created_at: string;
  updated_at: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: UserProfile;
}

interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false // Disabled for development
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If we're already refreshing, wait for the new token
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Try to refresh the token
            const response = await axios.post<{ access_token: string; refresh_token?: string }>(
              `${API_BASE_URL}/auth/refresh`, 
              { refresh_token: refreshToken }
            );
            
            const { access_token, refresh_token } = response.data;
            
            // Update the stored tokens
            localStorage.setItem('access_token', access_token);
            if (refresh_token) {
              localStorage.setItem('refresh_token', refresh_token);
            }

            // Update the authorization header
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }
            
            // Process all pending requests with the new token
            this.refreshSubscribers.forEach(callback => callback(access_token));
            this.refreshSubscribers = [];
            
            // Retry the original request with the new token
            return this.client(originalRequest);
          } catch (refreshError) {
            // If refresh fails, clear tokens and redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // ========== HTTP Methods ==========
  
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async delete<T = any>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  async patch<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  // ========== Auth Methods ==========
  
  async login(email: string, password: string): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await this.post<AuthResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const { access_token, refresh_token, user } = response.data;
    
    localStorage.setItem('access_token', access_token);
    if (refresh_token) {
      localStorage.setItem('refresh_token', refresh_token);
    }
    
    return { access_token, refresh_token, user };
  }

  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    phone_number: string;
    role?: 'tenant' | 'landlord' | 'admin';
    preferred_language?: 'en' | 'am' | 'om';
    preferred_currency?: 'ETB' | 'USD';
  }): Promise<AuthResponse> {
    try {
      console.log('Attempting to register with data:', {
        ...userData,
        password: '***', // Don't log the actual password
        role: userData.role || 'tenant',
        preferred_language: userData.preferred_language || 'en',
        preferred_currency: userData.preferred_currency || 'ETB',
      });

      const response = await this.post<AuthResponse>('/auth/register', {
        email: userData.email,
        password: userData.password,
        full_name: userData.full_name,
        phone_number: userData.phone_number,
        role: userData.role || 'tenant',
        preferred_language: userData.preferred_language || 'en',
        preferred_currency: userData.preferred_currency || 'ETB',
      });
      
      console.log('Registration successful, response:', response.data);
      
      const { access_token, refresh_token, user } = response.data;
      
      if (access_token) {
        localStorage.setItem('access_token', access_token);
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token);
        }
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data,
        },
      });
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  async getCurrentUser(): Promise<UserProfile> {
    const response = await this.get<{ data: UserProfile }>('/users/me');
    return response.data.data;
  }

  async googleAuth(token: string): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/google', { token });
    const { access_token, refresh_token, user } = response.data;
    
    if (access_token) {
      localStorage.setItem('access_token', access_token);
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token);
      }
    }
    
    return { access_token, refresh_token, user };
  }

  // ========== Password Management ==========
  
  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await this.post<ApiResponse>('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    const response = await this.post<ApiResponse>('/auth/reset-password', {
      token,
      new_password: newPassword
    });
    return response.data;
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse> {
    const response = await this.post<ApiResponse>('/auth/change-password', {
      current_password: oldPassword,
      new_password: newPassword
    });
    return response.data;
  }

  // ========== Profile Management ==========
  
  async getProfile(): Promise<UserProfile> {
    const response = await this.get<{ data: UserProfile }>('/users/me');
    return response.data.data;
  }

  async updateProfile(profileData: {
    full_name?: string;
    phone_number?: string | null;
    preferred_language?: 'en' | 'am' | 'om';
    preferred_currency?: 'ETB' | 'USD';
  }): Promise<UserProfile> {
    const response = await this.put<{ data: UserProfile }>('/users/me', profileData);
    return response.data.data;
  }
}

export const apiClient = new ApiClient()