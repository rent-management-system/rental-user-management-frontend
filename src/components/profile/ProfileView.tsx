"use client"

import { useAuth } from "@/hooks/useAuth"

export const ProfileView = () => {
  const { user } = useAuth()

  if (!user) {
    return <div className="text-center text-muted-foreground">No user data</div>
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 card">
      <div className="flex items-start gap-6">
        {/* Profile Photo */}
        <div className="w-24 h-24 rounded-full bg-muted flex-shrink-0 overflow-hidden">
          {user.profilePhoto ? (
            <img src={user.profilePhoto || "/placeholder.svg"} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
          <p className="text-muted-foreground">{user.email}</p>

          <div className="mt-4 space-y-2">
            {user.phone && (
              <p className="text-sm">
                <span className="font-medium">Phone:</span> {user.phone}
              </p>
            )}
            <p className="text-sm">
              <span className="font-medium">Role:</span> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </p>
            <p className="text-sm">
              <span className="font-medium">Language:</span>{" "}
              {user.preferredLanguage === "en"
                ? "English"
                : user.preferredLanguage === "am"
                  ? "Amharic"
                  : "Afaan Oromo"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
