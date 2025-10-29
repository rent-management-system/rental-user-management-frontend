import { describe, it, expect } from "vitest"
import type { User, UserRole } from "@/types"

describe("Profile Types", () => {
  it("should create valid user object", () => {
    const user: User = {
      id: "1",
      email: "test@example.com",
      name: "Test User",
      phone: "+1234567890",
      role: "tenant",
      preferredLanguage: "en",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    expect(user.email).toBe("test@example.com")
    expect(user.role).toBe("tenant")
    expect(user.preferredLanguage).toBe("en")
  })

  it("should handle different user roles", () => {
    const roles: Array<UserRole> = ["tenant", "landlord", "admin"]

    roles.forEach((role) => {
      const user: User = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        role,
        preferredLanguage: "en",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      expect(user.role).toBe(role)
    })
  })
})
