import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "@/lib/api-client";
import logo from "@/asset/W.jpg";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setErrors({ email: "Email is required" });
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setIsSuccess(false);
    setErrors({});

    try {
      const res = await apiClient.post("/auth/forgot-password", { email });
      const data = res.data;

      setIsSuccess(true);
      toast.success(data.message || "Reset link sent! Please check your email.");
    } catch (error: any) {
      console.error("Forgot password error:", error);
      
      let errorMessage = "Failed to send reset link";

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        const detail = data?.detail || data?.message || data?.error;
        const detailLower = typeof detail === 'string' ? detail.toLowerCase() : '';

        switch (status) {
          case 404:
            if (detailLower.includes('email') || detailLower.includes('user') || detailLower.includes('account')) {
              errorMessage = "Email not found. This email is not registered.";
              setErrors({ email: "Email not registered" });
            } else {
              errorMessage = detail || "Email not found";
            }
            break;

          case 400:
            errorMessage = detail || "Invalid request. Please check your email.";
            break;

          case 429:
            errorMessage = "Too many requests. Please wait a few minutes before trying again.";
            break;

          case 500:
            errorMessage = "Server error. Unable to send reset email. Please try again later.";
            break;

          default:
            errorMessage = detail || "Failed to send reset link. Please try again.";
        }
      } else if (error.request) {
        errorMessage = "Unable to connect to server. Please check your internet connection.";
      } else {
        errorMessage = error.message || "An unexpected error occurred";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex w-full max-w-5xl bg-white rounded-lg shadow-md overflow-hidden">
        {/* Left side - Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Forgot Password</h2>
          <p className="text-gray-600 mb-8">Enter your email to receive a password reset link.</p>

          {isSuccess && (
            <div className="mb-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="text-green-700 font-medium">Reset link sent successfully!</p>
              <p className="text-green-600 text-sm mt-1">Please check your email inbox and spam folder.</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({});
                }}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                  errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-gray-400"
                }`}
                placeholder="your-email@example.com"
                disabled={loading}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Send Reset Link button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Link"}
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
          <h1 className="text-3xl font-semibold text-gray-800">
          </h1>
        </div>
      </div>
    </div>
  );
}
