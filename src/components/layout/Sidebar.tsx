"use client"

import { useAuth } from "@/hooks/useAuth"
import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"

export const Sidebar = () => {
  const { user } = useAuth()
  const location = useLocation()
  const { t } = useTranslation()

  const isActive = (path: string) => location.pathname === path

  const commonLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/profile", label: "Profile" },
  ]

  const landlordLinks = [
    { path: "/properties", label: "My Properties" },
    { path: "/listings", label: "Active Listings" },
  ]

  const tenantLinks = [
    { path: "/search", label: "Search Properties" },
    { path: "/applications", label: "My Applications" },
    { path: "/saved", label: "Saved Properties" },
  ]

  const adminLinks = [
    { path: "/admin/users", label: "Manage Users" },
    { path: "/admin/properties", label: "Manage Properties" },
    { path: "/admin/reports", label: "Reports" },
  ]

  const getLinks = () => {
    const links = [...commonLinks]
    if (user?.role === "landlord") links.push(...landlordLinks)
    if (user?.role === "tenant") links.push(...tenantLinks)
    if (user?.role === "admin") links.push(...adminLinks)
    return links
  }

  return (
    <aside className="w-64 border-r border-border bg-background min-h-screen p-4">
      <nav className="space-y-2">
        {getLinks().map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`block px-4 py-2 rounded-lg transition-colors ${
              isActive(link.path) ? "bg-primary text-primary-foreground font-medium" : "text-foreground hover:bg-muted"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
