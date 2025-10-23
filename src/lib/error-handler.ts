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

export const handleApiError = (error: any): string => {
  if (error.response) {
    const status = error.response.status
    const message = error.response.data?.message || "An error occurred"

    switch (status) {
      case 400:
        return `Bad Request: ${message}`
      case 401:
        return "Unauthorized. Please login again."
      case 403:
        return "Forbidden. You don't have permission to access this resource."
      case 404:
        return "Resource not found."
      case 409:
        return `Conflict: ${message}`
      case 422:
        return `Validation Error: ${message}`
      case 500:
        return "Server error. Please try again later."
      case 503:
        return "Service unavailable. Please try again later."
      default:
        return message
    }
  }

  if (error.request) {
    return "No response from server. Please check your connection."
  }

  return error.message || "An unexpected error occurred"
}

export const showErrorToast = (error: any) => {
  const message = handleApiError(error)
  toast.error(message)
}

export const showSuccessToast = (message: string) => {
  toast.success(message)
}

export const showLoadingToast = (message: string) => {
  return toast.loading(message)
}
