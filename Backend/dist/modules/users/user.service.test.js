/**
 * @file        : Backend/src/modules/users/user.service.test.ts
 * @description : اختبارات خدمة المستخدمين ومسارات الإنشاء والتعديل والحذف.
 * @updated     : [
 *   { "date": "27/08/2026", "version": "1.0.0", "by": ["BomBa"], "comment": "إضافة اختبارات users service" }
 * ]
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
const usersRepository = {
    findAll: vi.fn(), findById: vi.fn(), findOne: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(),
};
vi.mock("@shared/repositories.js", () => ({ usersRepository }));
const { listUsers, getUserById, createUser, updateUser, deleteUser } = await import("./user.service.js");
const user = {
    id: "user-1", username: "admin", email: "admin@example.com", passwordHash: "hash",
    displayName: "Admin", roleIds: [], isActive: true,
    createdAt: "2026-08-27T00:00:00.000Z", updatedAt: "2026-08-27T00:00:00.000Z",
};
beforeEach(() => vi.clearAllMocks());
describe("users service", () => {
    it("يعرض المستخدمين بدون passwordHash", async () => {
        usersRepository.findAll.mockResolvedValue([user]);
        const result = await listUsers();
        expect(result).toEqual([{ id: user.id, username: user.username, email: user.email, displayName: user.displayName, roleIds: user.roleIds, isActive: user.isActive, createdAt: user.createdAt, updatedAt: user.updatedAt }]);
        expect(result[0]).not.toHaveProperty("passwordHash");
    });
    it("يرفض جلب مستخدم غير موجود", async () => {
        usersRepository.findById.mockResolvedValue(undefined);
        await expect(getUserById("missing")).rejects.toMatchObject({ code: "NOT_FOUND", status: 404 });
    });
    it("يرفض إنشاء مستخدم مكرر", async () => {
        usersRepository.findOne.mockResolvedValue(user);
        await expect(createUser({ username: "Admin", email: "other@example.com", password: "Strong123", displayName: "Other" }))
            .rejects.toMatchObject({ code: "CONFLICT", status: 409 });
    });
    it("يحدّث بيانات المستخدم الموجود", async () => {
        usersRepository.findById.mockResolvedValue(user);
        usersRepository.update.mockResolvedValue({ ...user, displayName: "Updated" });
        const result = await updateUser("user-1", { displayName: "Updated" });
        expect(result.displayName).toBe("Updated");
        expect(usersRepository.update).toHaveBeenCalledOnce();
    });
    it("يرفض حذف مستخدم غير موجود", async () => {
        usersRepository.delete.mockResolvedValue(false);
        await expect(deleteUser("missing")).rejects.toMatchObject({ code: "NOT_FOUND", status: 404 });
    });
});
//# sourceMappingURL=user.service.test.js.map