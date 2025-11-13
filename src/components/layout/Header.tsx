"use client"

import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { useTheme } from "@/hooks/useTheme"
import { useTranslation } from "react-i18next"

export const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { i18n } = useTranslation()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            R
          </div>
          <h1 className="text-xl font-bold text-foreground">Rental</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
            aria-label="Logout"
            title="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Language Selector */}
          <select
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="px-2 py-1 rounded-lg border border-border bg-background text-foreground text-sm"
          >
            <option value="en">EN</option>
            <option value="am">አማርኛ</option>
            <option value="om">Afaan</option>
          </select>

          {/* User Menu */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{user.full_name}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto || "/placeholder.svg"}
                    alt={user.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium">{user.full_name ? user.full_name.charAt(0).toUpperCase() : ''}</span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-lg bg-muted text-foreground text-sm hover:bg-muted/80 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
