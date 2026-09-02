/**
 * @file        : Backend/src/modules/auth/auth.service.test.ts
 * @description : اختبارات مسارات التسجيل وتسجيل الدخول وتجديد الجلسة.
 * @updated     : [
 *   { "date": "27/08/2026", "version": "1.0.0", "by": ["BomBa"], "comment": "إضافة اختبارات auth" }
 * ]
 */
import { beforeEach, describe, expect, it, vi } from "vitest"
import bcrypt from "bcryptjs"
import type { UserRecord } from "@modules/users/user.model.js"

const repositories = {
  usersRepository: { findOne: vi.fn(), findById: vi.fn(), create: vi.fn() },
  rolesRepository: { findOne: vi.fn(), findMany: vi.fn() },
  permissionsRepository: { findMany: vi.fn() },
  sessionsRepository: { create: vi.fn(), findById: vi.fn(), update: vi.fn() },
}

vi.mock("@shared/repositories.js", () => repositories)

const { loginUser, registerUser, refreshSession, logoutSession } = await import("./auth.service.js")

const user: UserRecord = {
  id: "user-1", username: "admin", email: "admin@example.com", phone: "+201001234567", passwordHash: "hash",
  displayName: "Admin", roleIds: ["role-1"], isActive: true,
  createdAt: "2026-08-27T00:00:00.000Z", updatedAt: "2026-08-27T00:00:00.000Z",
}

beforeEach(() => {
  vi.clearAllMocks()
  repositories.rolesRepository.findMany.mockResolvedValue([{ id: "role-1", name: "admin", permissionIds: ["perm-1"] }])
  repositories.permissionsRepository.findMany.mockResolvedValue([{ id: "perm-1", key: "users.read" }])
  repositories.sessionsRepository.create.mockResolvedValue(undefined)
  repositories.sessionsRepository.update.mockResolvedValue(undefined)
})

describe("auth service", () => {
  it("يسجل مستخدم جديد بدون تسريب passwordHash", async () => {
    repositories.usersRepository.findOne.mockResolvedValue(undefined)
    repositories.rolesRepository.findOne.mockResolvedValue({ id: "role-user", name: "user", permissionIds: [] })

    const result = await registerUser({ username: "new-user", email: "new@example.com", phone: null, password: "Strong123", displayName: "New User" })

    expect(result).not.toHaveProperty("passwordHash")
    expect(repositories.usersRepository.create).toHaveBeenCalledOnce()
  })

  it("يرفض تسجيل الدخول لمستخدم غير موجود", async () => {
    repositories.usersRepository.findOne.mockResolvedValue(undefined)

    await expect(loginUser({ identifier: "missing", password: "Strong123", rememberMe: false }, null))
      .rejects.toMatchObject({ code: "INVALID_CREDENTIALS", status: 401 })
  })

  it("يسجل الدخول بالـ email وينشئ session", async () => {
    repositories.usersRepository.findOne.mockResolvedValue(user)
    vi.spyOn(bcrypt, "compare").mockResolvedValue(true as never)

    const result = await loginUser({ identifier: "ADMIN@EXAMPLE.COM", password: "Strong123", rememberMe: true }, "Vitest")

    expect(result.user).not.toHaveProperty("passwordHash")
    expect(result.roleNames).toEqual(["admin"])
    expect(repositories.sessionsRepository.create).toHaveBeenCalledOnce()
  })

  it("يسجل الدخول برقم الجوال مهما اختلف التنسيق", async () => {
    repositories.usersRepository.findOne.mockImplementation(async (predicate: (u: UserRecord) => boolean) =>
      predicate(user) ? user : undefined
    )
    vi.spyOn(bcrypt, "compare").mockResolvedValue(true as never)

    const result = await loginUser({ identifier: "+20 100-123-4567", password: "Strong123", rememberMe: false }, null)

    expect(result.user.username).toBe("admin")
  })

  it("يرفض رقم جوال قصير أو غير مطابق", async () => {
    repositories.usersRepository.findOne.mockImplementation(async (predicate: (u: UserRecord) => boolean) =>
      predicate(user) ? user : undefined
    )

    await expect(loginUser({ identifier: "12345", password: "Strong123", rememberMe: false }, null))
      .rejects.toMatchObject({ code: "INVALID_CREDENTIALS", status: 401 })
  })

  it("يرفض refresh لجلسة منتهية", async () => {
    repositories.sessionsRepository.findById.mockResolvedValue({ revokedAt: null, expiresAt: "2020-01-01T00:00:00.000Z" })

    await expect(refreshSession("not-a-real-token", null)).rejects.toMatchObject({ code: "INVALID_REFRESH_TOKEN" })
  })

  it("يتجاهل logout بدون refresh token", async () => {
    await logoutSession(undefined)
    expect(repositories.sessionsRepository.update).not.toHaveBeenCalled()
  })
})

