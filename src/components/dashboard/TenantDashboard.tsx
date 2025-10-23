"use client"

import { useTranslation } from "react-i18next"

export const TenantDashboard = () => {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Welcome, Tenant!</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Saved Properties Card */}
        <div className="card">
          <h3 className="text-lg font-semibold text-foreground mb-2">Saved Properties</h3>
          <p className="text-3xl font-bold text-primary">12</p>
          <p className="text-sm text-muted-foreground mt-2">Properties you've bookmarked</p>
        </div>

        {/* Active Applications Card */}
        <div className="card">
          <h3 className="text-lg font-semibold text-foreground mb-2">Active Applications</h3>
          <p className="text-3xl font-bold text-secondary">3</p>
          <p className="text-sm text-muted-foreground mt-2">Pending applications</p>
        </div>

        {/* Viewed Properties Card */}
        <div className="card">
          <h3 className="text-lg font-semibold text-foreground mb-2">Recently Viewed</h3>
          <p className="text-3xl font-bold text-accent">8</p>
          <p className="text-sm text-muted-foreground mt-2">Properties viewed this month</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <p className="font-medium text-foreground">Applied to 3-bed apartment</p>
              <p className="text-sm text-muted-foreground">2 days ago</p>
            </div>
            <span className="px-2 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-medium">Pending</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <p className="font-medium text-foreground">Saved downtown loft</p>
              <p className="text-sm text-muted-foreground">5 days ago</p>
            </div>
            <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">Saved</span>
          </div>
        </div>
      </div>
    </div>
  )
}
