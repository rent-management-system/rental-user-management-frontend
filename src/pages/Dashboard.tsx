"use client"

import { useAuth } from "@/hooks/useAuth"
import { TenantDashboard } from "@/components/dashboard/TenantDashboard"
import { LandlordDashboard } from "@/components/dashboard/LandlordDashboard"
import { AdminDashboard } from "@/components/dashboard/AdminDashboard"

export const Dashboard = () => {
  const { user } = useAuth()

  const renderDashboard = () => {
    switch (user?.role) {
      case "tenant":
        return <TenantDashboard />
      case "landlord":
        return <LandlordDashboard />
      case "admin":
        return <AdminDashboard />
      default:
        return <div>Unknown role</div>
    }
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">{renderDashboard()}</div>
    </div>
  )
}
