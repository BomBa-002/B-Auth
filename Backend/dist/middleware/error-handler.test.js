/**
 * @file        : Backend/src/middleware/error-handler.test.ts
 * @description : اختبارات تحويل أخطاء التطبيق إلى استجابات API موحّدة.
 * @updated     : [{ "date": "28/08/2026", "version": "1.0.0", "by": ["v0"], "comment": "إضافة اختبارات معالجة الأخطاء" }]
 */
import { describe, expect, it, vi } from "vitest";
import { ZodError, z } from "zod";
import { AppError } from "@shared/app-error.js";
import { errorHandler } from "./error-handler.js";
const request = { method: "GET", originalUrl: "/api/test" };
const next = vi.fn();
function createResponse() {
    const response = { status: vi.fn(), json: vi.fn() };
    response.status.mockReturnValue(response);
    return response;
}
describe("error handler", () => {
    it("يرجع كود ورسالة AppError بدون تغيير", () => {
        const response = createResponse();
        errorHandler(new AppError(401, "UNAUTHORIZED", "Authentication required."), request, response, next);
        expect(response.status).toHaveBeenCalledWith(401);
        expect(response.json).toHaveBeenCalledWith({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } });
    });
    it("يحوّل أخطاء Zod إلى VALIDATION_ERROR", () => {
        const response = createResponse();
        const schema = z.object({ email: z.string().email() });
        const result = schema.safeParse({ email: "bad-email" });
        if (result.success)
            throw new Error("Expected validation to fail");
        errorHandler(new ZodError(result.error.issues), request, response, next);
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.objectContaining({ code: "VALIDATION_ERROR" }) }));
    });
});
//# sourceMappingURL=error-handler.test.js.map