import toast from "react-hot-toast"

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/**
 * Get detailed, user-friendly error message from API error
 */
export const getDetailedErrorMessage = (error: any): string => {
  if (!error.response) {
    if (error.request) {
      return "Unable to connect to server. Please check your internet connection."
    }
    return error.message || "An unexpected error occurred"
  }

  const status = error.response.status
  const data = error.response.data
  const detail = data?.detail || data?.message || data?.error

  // Handle array of error messages
  if (Array.isArray(detail)) {
    return detail.join(", ")
  }

  const detailLower = typeof detail === 'string' ? detail.toLowerCase() : ''

  switch (status) {
    case 400:
      return detail || "Invalid request. Please check your input."
    
    case 401:
      // Check for specific authentication errors
      if (detailLower.includes('incorrect') || 
          detailLower.includes('invalid credentials') ||
          detailLower.includes('wrong password')) {
        return "Incorrect email or password"
      }
      if (detailLower.includes('email')) {
        return "Email not found. Please check your email or sign up."
      }
      return detail || "Authentication failed. Please check your credentials."
    
    case 403:
      if (detailLower.includes('disabled') || detailLower.includes('inactive')) {
        return "Your account has been disabled. Please contact support."
      }
      return "Access denied. You don't have permission to perform this action."
    
    case 404:
      if (detailLower.includes('user') || detailLower.includes('account')) {
        return "Account not found. Please check your email or sign up."
      }
      if (detailLower.includes('email')) {
        return "Email not registered. Please sign up first."
      }
      return detail || "Resource not found."
    
    case 409:
      if (detailLower.includes('email') || detailLower.includes('already exists')) {
        return "This email is already registered. Please login or use a different email."
      }
      return detail || "Conflict. This resource already exists."
    
    case 422:
      return detail || "Validation error. Please check all fields."
    
    case 429:
      return "Too many requests. Please wait a moment and try again."
    
    case 500:
      return "Server error. Something went wrong on our end. Please try again later."
    
    case 503:
      return "Service temporarily unavailable. Please try again in a few minutes."
    
    default:
      return detail || "An error occurred. Please try again."
  }
}

export const handleApiError = (error: any): string => {
  return getDetailedErrorMessage(error)
}

export const showErrorToast = (error: any) => {
  const message = handleApiError(error)
  toast.error(message, { duration: 5000 })
}

export const showSuccessToast = (message: string) => {
  toast.success(message, { duration: 3000 })
}

export const showLoadingToast = (message: string) => {
  return toast.loading(message)
}
