import { describe, it, expect } from "vitest"
import type { User, UserRole } from "../types.d"

describe("Profile Types", () => {
  it("should create valid user object", () => {
    const user: User = {
      id: "1",
      email: "test@example.com",
      name: "Test User",  // Keep the name field
      full_name: "Test User Full Name",  // Add full_name
      phone: "+1234567890",
      role: "tenant",
      preferred_language: "en",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    expect(user.email).toBe("test@example.com")
    expect(user.role).toBe("tenant")
    expect(user.preferred_language).toBe("en")
  })

  it("should handle different user roles", () => {
    const roles: Array<UserRole> = ["tenant", "landlord", "admin"]

    roles.forEach((role) => {
      const user: User = {
        id: "1",
        email: "test@example.com",
        name: "Test User",  // Keep the name field
        full_name: "Test User Full Name",  // Add full_name
        phone: "+1234567890",
        role,
        preferred_language: "en",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      expect(user.role).toBe(role)
    })
  })
})