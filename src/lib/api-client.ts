import axios, { type AxiosInstance } from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"

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
  }

  async login(email: string, password: string) {
    const response = await this.client.post("/auth/login", { email, password })
    return response.data
  }

  async signup(name: string, email: string, password: string, role: string) {
    const response = await this.client.post("/auth/signup", {
      name,
      email,
      password,
      role,
    })
    return response.data
  }

  async googleAuth(token: string) {
    const response = await this.client.post("/auth/google", { token })
    return response.data
  }

  async forgotPassword(email: string) {
    const response = await this.client.post("/auth/forgot-password", { email })
    return response.data
  }

  async resetPassword(token: string, password: string) {
    const response = await this.client.post("/auth/reset-password", {
      token,
      password,
    })
    return response.data
  }

  async getProfile() {
    const response = await this.client.get("/user/profile")
    return response.data
  }

  async updateProfile(data: FormData) {
    const response = await this.client.put("/user/profile", data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  }
}

export const apiClient = new ApiClient()
