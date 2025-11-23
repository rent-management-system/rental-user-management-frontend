import { useState } from "react";
import logo from "@/asset/W.jpg"
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";


export default function ForgotPassword() {
  const { t, i18n } = useTranslation();

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:8000/forgot-password", { // This will be updated later
      const res = await fetch("https://rent-managment-system-user-magt.onrender.com/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.detail || t("forgotPassword.somethingWentWrong"));
      } else {
        setMessage(data.message || t("forgotPassword.resetLinkSent"));
      }
    } catch (error) {
      setMessage(t("forgotPassword.serverNotReachable"));
        setMessage(data.detail || "Something went wrong");
      } else {
        setMessage(data.message || "Reset link sent successfully!");
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
          <div className="flex justify-end mb-4">
            <select
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
              className="px-2 py-1 border rounded-md"
            >
              <option value="en">English</option>
              <option value="am">Amharic</option>
              <option value="om">Afaan Oromo</option>
            </select>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t("forgotPassword.title")}</h2>
          <p className="text-gray-600 mb-8">{t("forgotPassword.instructions")}</p>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Forgot Password</h2>
          <p className="text-gray-600 mb-8">Enter your email to receive a password reset link.</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t("forgotPassword.emailLabel")}
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 border-gray-300 focus:ring-gray-400"
                placeholder={t("forgotPassword.emailPlaceholder")}
                placeholder="your-company@email.com"
                required
              />
            </div>

            {/* Send Reset Link button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition disabled:opacity-70"
            >
              {loading ? t("forgotPassword.sending") : t("forgotPassword.sendResetLink")}
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}

          <div className="text-sm text-center mt-4">
            <Link to="/login" className="font-medium text-orange-600 hover:underline">
              {t('forgotPassword.backToLogin')}
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
