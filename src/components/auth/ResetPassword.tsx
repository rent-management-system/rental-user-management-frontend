import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "@/lib/api-client";
import logo from "@/asset/W.jpg";

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; token?: string }>({});
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      setErrors({ token: "Invalid or missing reset token" });
      toast.error("Invalid reset link. Please request a new password reset.");
    }
    setToken(t || "");
  }, []);

  const validateForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Invalid reset link. Please request a new password reset.");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the errors and try again");
      return;
    }

    setLoading(true);
    setIsSuccess(false);

    try {
      const res = await apiClient.post("/auth/reset-password", { 
        token, 
        new_password: password 
      });

      const data = res.data;
      setIsSuccess(true);
      
      toast.success(data.message || "Password reset successful! Redirecting to login...");

      // Redirect to login after 3 seconds
      setTimeout(() => navigate("/login"), 3000);
    } catch (error: any) {
      console.error("Reset password error:", error);
      
      let errorMessage = "Failed to reset password";

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        const detail = data?.detail || data?.message || data?.error;
        const detailLower = typeof detail === 'string' ? detail.toLowerCase() : '';

        switch (status) {
          case 400:
            if (detailLower.includes('token') || detailLower.includes('invalid') || detailLower.includes('expired')) {
              errorMessage = "Invalid or expired reset link. Please request a new password reset.";
              setErrors({ token: "Invalid or expired token" });
            } else {
              errorMessage = detail || "Invalid request. Please try again.";
            }
            break;

          case 404:
            errorMessage = "Invalid reset token. Please request a new password reset link.";
            setErrors({ token: "Token not found" });
            break;

          case 422:
            errorMessage = detail || "Validation error. Please check your password.";
            break;

          case 500:
            errorMessage = "Server error. Unable to reset password. Please try again later.";
            break;

          default:
            errorMessage = detail || "Failed to reset password. Please try again.";
        }
      } else if (error.request) {
        errorMessage = "Unable to connect to server. Please check your internet connection.";
      } else {
        errorMessage = error.message || "An unexpected error occurred";
      }

      toast.error(errorMessage);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex w-full max-w-5xl bg-white rounded-lg shadow-md overflow-hidden">
        {/* Left side - Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Reset Password</h2>
          <p className="text-gray-600 mb-8">Enter your new password.</p>

          {errors.token && (
            <div className="mb-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
              <p className="text-red-700 font-medium">Invalid Reset Link</p>
              <p className="text-red-600 text-sm mt-1">{errors.token}</p>
              <Link to="/forgot-password" className="text-sm text-red-700 hover:underline mt-2 inline-block">
                Request a new reset link →
              </Link>
            </div>
          )}

          {isSuccess && (
            <div className="mb-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="text-green-700 font-medium">Password Reset Successful!</p>
              <p className="text-green-600 text-sm mt-1">Redirecting to login page...</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 pr-10 ${
                    errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-400"
                  }`}
                  placeholder="••••••••"
                  disabled={loading || !!errors.token}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                  }}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 pr-10 ${
                    errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-400"
                  }`}
                  placeholder="••••••••"
                  disabled={loading || !!errors.token}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || !!errors.token}
              className="w-full py-2 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-800">
              ← Back to Login
            </Link>
          </div>
        </div>

        {/* Right side - Logo and text */}
        <div className="hidden md:flex w-1/2 bg-white border-l border-gray-200 items-center justify-center flex-col p-10">
          <img src={logo} alt="tesfa.ai logo" className="w-45 h45 mb-4" />
          <h1 className="text-3xl font-semibold text-gray-800"></h1>
        </div>
      </div>
    </div>
  );
}
