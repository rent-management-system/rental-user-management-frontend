"use client"

import { useTranslation } from "react-i18next"

export const LandlordDashboard = () => {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Welcome, Landlord!</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Listings Card */}
        <div className="card">
          <h3 className="text-lg font-semibold text-foreground mb-2">Active Listings</h3>
          <p className="text-3xl font-bold text-primary">5</p>
          <p className="text-sm text-muted-foreground mt-2">Properties currently listed</p>
        </div>

        {/* Pending Applications Card */}
        <div className="card">
          <h3 className="text-lg font-semibold text-foreground mb-2">Pending Applications</h3>
          <p className="text-3xl font-bold text-secondary">7</p>
          <p className="text-sm text-muted-foreground mt-2">Awaiting your review</p>
        </div>

        {/* Total Views Card */}
        <div className="card">
          <h3 className="text-lg font-semibold text-foreground mb-2">Total Views</h3>
          <p className="text-3xl font-bold text-accent">342</p>
          <p className="text-sm text-muted-foreground mt-2">This month</p>
        </div>
      </div>

      {/* List Property Button */}
      <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Ready to list a new property?</h3>
            <p className="text-sm text-muted-foreground mt-1">Add your property to reach more tenants</p>
          </div>
          <button className="btn-primary">List Property</button>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Applications</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <p className="font-medium text-foreground">John Doe - 3-bed apartment</p>
              <p className="text-sm text-muted-foreground">Applied 1 day ago</p>
            </div>
            <button className="text-primary hover:underline text-sm">Review</button>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <p className="font-medium text-foreground">Jane Smith - Downtown loft</p>
              <p className="text-sm text-muted-foreground">Applied 3 days ago</p>
            </div>
            <button className="text-primary hover:underline text-sm">Review</button>
          </div>
        </div>
      </div>
    </div>
  )
}
