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
  // Keep role types aligned with the rest of the frontend
  role: 'tenant' | 'landlord' | 'admin' | 'owner' | 'broker';
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

      const { access_token, refresh_token, user: _user } = response.data;
      // store tokens if present
      if (access_token) {
        localStorage.setItem('access_token', access_token)
        if (refresh_token) localStorage.setItem('refresh_token', refresh_token)
      }

      // If backend did not include user object, try to decode JWT claims
      let resolvedUser = _user
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
        password: '***'
      });
      const response = await this.post<{ user: UserProfile; access_token?: string; refresh_token?: string }>(
        '/auth/register', 
        userData
      );

      const { user, access_token, refresh_token } = response.data;

      // store tokens if present
      if (access_token) {
        localStorage.setItem('access_token', access_token);
        if (refresh_token) localStorage.setItem('refresh_token', refresh_token);
      }

      return { user, access_token, refresh_token };
    } catch (err: any) {
      console.error('apiClient.register error', {
        message: err.message,
        status: err.response?.status,
        body: err.response?.data,
        headers: err.response?.headers,
        config: err.config,
      });
      throw err;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } catch (err) {
      console.error('apiClient.logout error', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
  }

  async getMe(): Promise<UserProfile> {
    try {
      const response = await this.client.get<UserProfile>('/users/me');
      return response.data;
    } catch (err) {
      console.error('apiClient.getMe error', err);
      throw err;
    }
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await this.client.patch<UserProfile>('/users/me', data);
      return response.data;
    } catch (err) {
      console.error('apiClient.updateProfile error', err);
      throw err;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await this.client.patch('/users/me/password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
    } catch (err) {
      console.error('apiClient.changePassword error', err);
      throw err;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await this.client.post('/auth/reset-password', { email });
    } catch (err) {
      console.error('apiClient.resetPassword error', err);
      throw err;
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      await this.client.post('/auth/verify-email', { token });
    } catch (err) {
      console.error('apiClient.verifyEmail error', err);
      throw err;
    }
  }
}

export default new ApiClient();

