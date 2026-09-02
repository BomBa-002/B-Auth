/**
 * @file        : Backend/src/modules/users/user.service.test.ts
 * @description : اختبارات خدمة المستخدمين ومسارات الإنشاء والتعديل والحذف وحمايات الأدمن.
 * @updated     : [
 *   { "date": "27/08/2026", "version": "1.0.0", "by": ["BomBa"], "comment": "إضافة اختبارات users service" },
 *   { "date": "02/09/2026", "version": "1.1.0", "by": ["v0"], "comment": "تحديث التوقيعات (actorId) وإضافة اختبارات حمايات الأدمن وتفرد البريد وصلاحية roleIds" }
 * ]
 */
import { beforeEach, describe, expect, it, vi } from "vitest"

const usersRepository = {
  findAll: vi.fn(), findById: vi.fn(), findOne: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(),
}
const rolesRepository = {
  findAll: vi.fn(), findById: vi.fn(), findOne: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(),
}

vi.mock("@shared/repositories.js", () => ({ usersRepository, rolesRepository }))

const { listUsers, getUserById, createUser, updateUser, deleteUser } = await import("./user.service.js")

const user = {
  id: "user-1", username: "admin", email: "admin@example.com", passwordHash: "hash",
  displayName: "Admin", roleIds: [], isActive: true,
  createdAt: "2026-08-27T00:00:00.000Z", updatedAt: "2026-08-27T00:00:00.000Z",
}

beforeEach(() => {
  vi.clearAllMocks()
  // الافتراضي: مفيش دور أدمن — الاختبارات الخاصة بالأدمن بتظبطه بنفسها.
  rolesRepository.findOne.mockResolvedValue(undefined)
  rolesRepository.findMany.mockResolvedValue([])
})

describe("users service", () => {
  it("يعرض المستخدمين بدون passwordHash", async () => {
    usersRepository.findAll.mockResolvedValue([user])
    const result = await listUsers()
    expect(result).toEqual([{ id: user.id, username: user.username, email: user.email, displayName: user.displayName, roleIds: user.roleIds, isActive: user.isActive, createdAt: user.createdAt, updatedAt: user.updatedAt }])
    expect(result[0]).not.toHaveProperty("passwordHash")
  })

  it("يرفض جلب مستخدم غير موجود", async () => {
    usersRepository.findById.mockResolvedValue(undefined)
    await expect(getUserById("missing")).rejects.toMatchObject({ code: "NOT_FOUND", status: 404 })
  })

  it("يرفض إنشاء مستخدم مكرر", async () => {
    usersRepository.findOne.mockResolvedValue(user)
    await expect(createUser({ username: "Admin", email: "other@example.com", password: "Strong123", displayName: "Other" }))
      .rejects.toMatchObject({ code: "CONFLICT", status: 409 })
  })

  it("يحدّث بيانات المستخدم الموجود", async () => {
    usersRepository.findById.mockResolvedValue(user)
    usersRepository.update.mockResolvedValue({ ...user, displayName: "Updated" })
    const result = await updateUser("user-1", "actor-1", { displayName: "Updated" })
    expect(result.displayName).toBe("Updated")
    expect(usersRepository.update).toHaveBeenCalledOnce()
  })

  it("يرفض حذف مستخدم غير موجود", async () => {
    usersRepository.delete.mockResolvedValue(false)
    await expect(deleteUser("missing", "actor-1")).rejects.toMatchObject({ code: "NOT_FOUND", status: 404 })
  })

  it("يرفض حذف المستخدم لنفسه", async () => {
    await expect(deleteUser("user-1", "user-1")).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 })
    expect(usersRepository.delete).not.toHaveBeenCalled()
  })

  it("يرفض تعطيل المستخدم لنفسه", async () => {
    usersRepository.findById.mockResolvedValue(user)
    await expect(updateUser("user-1", "user-1", { isActive: false })).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 })
    expect(usersRepository.update).not.toHaveBeenCalled()
  })

  it("يرفض تعطيل آخر أدمن نشط", async () => {
    const adminUser = { ...user, roleIds: ["role-admin"] }
    rolesRepository.findOne.mockResolvedValue({ id: "role-admin", name: "Admin" })
    usersRepository.findById.mockResolvedValue(adminUser)
    usersRepository.findMany.mockResolvedValue([adminUser])
    await expect(updateUser("user-1", "actor-1", { isActive: false })).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 })
    expect(usersRepository.update).not.toHaveBeenCalled()
  })

  it("يرفض تشيل دور الأدمن من آخر أدمن", async () => {
    const adminUser = { ...user, roleIds: ["role-admin"] }
    rolesRepository.findOne.mockResolvedValue({ id: "role-admin", name: "Admin" })
    usersRepository.findById.mockResolvedValue(adminUser)
    usersRepository.findMany.mockResolvedValue([adminUser])
    await expect(updateUser("user-1", "actor-1", { roleIds: [] })).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 })
    expect(usersRepository.update).not.toHaveBeenCalled()
  })

  it("يرفض roleIds غير موجودة", async () => {
    usersRepository.findById.mockResolvedValue(user)
    rolesRepository.findMany.mockResolvedValue([]) // مفيش أي دور من المطلوب موجود
    await expect(updateUser("user-1", "actor-1", { roleIds: ["ghost-role"] })).rejects.toMatchObject({ code: "BAD_REQUEST", status: 400 })
    expect(usersRepository.update).not.toHaveBeenCalled()
  })

  it("يرفض بريد إلكتروني مكرر عند التحديث", async () => {
    usersRepository.findById.mockResolvedValue(user)
    usersRepository.findOne.mockResolvedValue({ ...user, id: "user-2", email: "taken@example.com" })
    await expect(updateUser("user-1", "actor-1", { email: "taken@example.com" })).rejects.toMatchObject({ code: "CONFLICT", status: 409 })
    expect(usersRepository.update).not.toHaveBeenCalled()
  })
})
