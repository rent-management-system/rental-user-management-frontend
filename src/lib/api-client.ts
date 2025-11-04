import axios, { 
  AxiosInstance, 
  AxiosError, 
  AxiosRequestConfig, 
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://rent-managment-system-user-magt.onrender.com/api/v1";

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

  // Small helper to decode a JWT payload (no external dependency)
  private decodeJwtPayload(token: string): Record<string, any> | null {
    try {
      const parts = token.split('.')
      if (parts.length < 2) return null
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      // atob is available in browser env
      const json = decodeURIComponent(
        Array.prototype.map
          .call(atob(payload), (c: string) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
          })
          .join('')
      )
      return JSON.parse(json)
    } catch {
      return null
    }
  }

  // ========== Auth Methods ==========
  
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)

      const response = await this.post<AuthResponse>('/auth/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const { access_token, refresh_token, user } = response.data
      // store tokens if present
      if (access_token) {
        localStorage.setItem('access_token', access_token)
        if (refresh_token) localStorage.setItem('refresh_token', refresh_token)
      }

      // If backend did not include user object, try to decode JWT claims
      let resolvedUser = user
      if (!resolvedUser && access_token) {
        const claims = this.decodeJwtPayload(access_token)
        if (claims) {
          resolvedUser = {
            id: claims.user_id ?? claims.sub ?? claims.id ?? '',
            email: claims.email ?? email,
            full_name: claims.full_name ?? (claims.name ?? ''),
            phone_number: claims.phone_number ?? null,
            role: claims.role ?? claims.roles ?? '',
            is_active: claims.is_active ?? true,
            preferred_language: (claims.preferred_language ?? 'en') as 'en' | 'am' | 'om',
            preferred_currency: (claims.preferred_currency ?? 'ETB') as 'ETB' | 'USD',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        }
      }

      return { access_token, refresh_token, user: resolvedUser } as AuthResponse
    } catch (err: any) {
      console.error('apiClient.login error', {
        message: err.message,
        status: err.response?.status,
        body: err.response?.data,
        headers: err.response?.headers,
        config: err.config,
      })
      throw err
    }
  }

  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    phone_number: string;
    role?: 'tenant' | 'landlord' | 'admin';
    preferred_language?: 'en' | 'am' | 'om';
    preferred_currency?: 'ETB' | 'USD';
  }): Promise<{ user: UserProfile; access_token?: string; refresh_token?: string }> {
    try {
      console.log('Attempting to register with data:', {
        ...userData,
        password: '***', // Don't log the actual password
        role: userData.role || 'tenant',
        preferred_language: userData.preferred_language || 'en',
        preferred_currency: userData.preferred_currency || 'ETB',
      });

      const response = await this.post<any>('/users/register', {
        email: userData.email,
        password: userData.password,
        full_name: userData.full_name,
        phone_number: userData.phone_number,
        role: userData.role || 'tenant',
        preferred_language: userData.preferred_language || 'en',
        preferred_currency: userData.preferred_currency || 'ETB',
      });

      const payload = response.data;

      // If backend returned tokens + user
      if (payload.access_token) {
        localStorage.setItem('access_token', payload.access_token);
        if (payload.refresh_token) localStorage.setItem('refresh_token', payload.refresh_token);
        return { user: payload.user, access_token: payload.access_token, refresh_token: payload.refresh_token };
      }

      // If backend returned a user object directly or wrapped in { data: user }:
      const user = payload.user ?? payload.data ?? payload;
      return { user };
    } catch (error: any) {
      console.error('Registration error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
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

