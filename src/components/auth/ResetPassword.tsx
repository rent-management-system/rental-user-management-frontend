import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") || "");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:8000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.detail || "Something went wrong");
      } else {
        setMessage(data.message || "Password updated successfully!");
      }
    } catch (error) {
      setMessage("Server not reachable. Check if backend is running.");
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

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 border-gray-300 focus:ring-gray-400"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Reset Password button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition disabled:opacity-70"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>

          {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
          {message.includes("successfully") && (
            <p className="mt-4 text-center text-sm text-gray-600">
              You can now <Link to="/login" className="text-orange-600 hover:underline">log in</Link> with your new password.
            </p>
          )}
        </div>

        {/* Right side - Logo and text */}
        <div className="hidden md:flex w-1/2 bg-white border-l border-gray-200 items-center justify-center flex-col p-10">
          <img src="/logo.png" alt="tesfa.ai logo" className="w-24 h-24 mb-4" />
          <h1 className="text-3xl font-semibold text-gray-800">
          </h1>
        </div>
      </div>
    </div>
  );
}