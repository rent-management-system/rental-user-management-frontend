import { describe, it, expect } from "vitest"
import { validateEmail, validatePassword } from "@/lib/validation"

describe("Auth Validation", () => {
  describe("validateEmail", () => {
    it("should validate correct email format", () => {
      expect(validateEmail("user@example.com")).toBe(true)
      expect(validateEmail("test.user@domain.co.uk")).toBe(true)
    })

    it("should reject invalid email format", () => {
      expect(validateEmail("invalid.email")).toBe(false)
      expect(validateEmail("@example.com")).toBe(false)
      expect(validateEmail("user@")).toBe(false)
    })
  })

  describe("validatePassword", () => {
    it("should validate password with minimum 6 characters", () => {
      expect(validatePassword("password123")).toBe(true)
      expect(validatePassword("123456")).toBe(true)
    })

    it("should reject password with less than 6 characters", () => {
      expect(validatePassword("12345")).toBe(false)
      expect(validatePassword("pass")).toBe(false)
    })
  })
})
