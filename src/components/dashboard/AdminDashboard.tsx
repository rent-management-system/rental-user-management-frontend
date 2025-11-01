"use client"

export const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Users Card */}
        <div className="card">
          <h3 className="text-lg font-semibold text-foreground mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-primary">1,234</p>
          <p className="text-sm text-muted-foreground mt-2">Active users</p>
        </div>

        {/* Total Properties Card */}
        <div className="card">
          <h3 className="text-lg font-semibold text-foreground mb-2">Total Properties</h3>
          <p className="text-3xl font-bold text-secondary">567</p>
          <p className="text-sm text-muted-foreground mt-2">Listed properties</p>
        </div>

        {/* Pending Reports Card */}
        <div className="card">
          <h3 className="text-lg font-semibold text-foreground mb-2">Pending Reports</h3>
          <p className="text-3xl font-bold text-accent">12</p>
          <p className="text-sm text-muted-foreground mt-2">Awaiting review</p>
        </div>

        {/* System Health Card */}
        <div className="card">
          <h3 className="text-lg font-semibold text-foreground mb-2">System Health</h3>
          <p className="text-3xl font-bold text-green-500">99.9%</p>
          <p className="text-sm text-muted-foreground mt-2">Uptime</p>
        </div>
      </div>

      {/* User Management */}
      <div className="card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-medium text-foreground">Name</th>
                <th className="text-left py-2 px-2 font-medium text-foreground">Email</th>
                <th className="text-left py-2 px-2 font-medium text-foreground">Role</th>
                <th className="text-left py-2 px-2 font-medium text-foreground">Status</th>
                <th className="text-left py-2 px-2 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border hover:bg-muted/50">
                <td className="py-2 px-2">John Doe</td>
                <td className="py-2 px-2">john@example.com</td>
                <td className="py-2 px-2">Tenant</td>
                <td className="py-2 px-2">
                  <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-700 text-xs font-medium">
                    Active
                  </span>
                </td>
                <td className="py-2 px-2">
                  <button className="text-primary hover:underline text-xs">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
