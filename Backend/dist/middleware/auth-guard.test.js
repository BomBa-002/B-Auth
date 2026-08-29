/**
 * @file        : Backend/src/middleware/auth-guard.test.ts
 * @description : اختبارات حارس المصادقة والصلاحيات والأدوار.
 * @updated     : [{ "date": "28/08/2026", "version": "1.0.0", "by": ["v0"], "comment": "إضافة اختبارات حماية المسارات" }]
 */
import { describe, expect, it, vi } from "vitest";
import { AppError } from "@shared/app-error.js";
import { requireAuth, requirePermissions, requireRoles } from "./auth-guard.js";
const createRequest = (authorization) => ({ headers: authorization ? { authorization } : {} });
const response = {};
const next = vi.fn();
const validToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLTEifQ.signature";
describe("auth guard", () => {
    it("يرفض الطلب بدون Bearer token", () => {
        expect(() => requireAuth(createRequest(), response, next)).toThrowError(AppError);
        expect(next).not.toHaveBeenCalled();
    });
    it("يرفض token غير صالح", () => {
        expect(() => requireAuth(createRequest(`Bearer ${validToken}`), response, next)).toThrowError(AppError);
        expect(next).not.toHaveBeenCalled();
    });
    it("يرفض الصلاحية قبل اكتمال المصادقة", () => {
        const middleware = requirePermissions("users.read");
        expect(() => middleware(createRequest(), response, next)).toThrowError(AppError);
    });
    it("يرفض الدور قبل اكتمال المصادقة", () => {
        const middleware = requireRoles("Admin");
        expect(() => middleware(createRequest(), response, next)).toThrowError(AppError);
    });
});
//# sourceMappingURL=auth-guard.test.js.map