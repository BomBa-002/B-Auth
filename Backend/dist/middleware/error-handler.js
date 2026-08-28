import { ZodError } from "zod";
import { AppError } from "@shared/app-error.js";
import { sendError } from "@shared/response.js";
import { isDevelopment } from "@config/env.js";
/** Wraps async route handlers so rejected promises reach the error middleware. */
export function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
export function notFoundHandler(req, res) {
    sendError(res, 404, "NOT_FOUND", `Route ${req.method} ${req.originalUrl} does not exist.`);
}
export function errorHandler(err, req, res, _next) {
    if (err instanceof AppError) {
        return sendError(res, err.status, err.code, err.message, err.details);
    }
    if (err instanceof ZodError) {
        return sendError(res, 400, "VALIDATION_ERROR", "Request validation failed.", err.flatten());
    }
    console.error("[error-handler] Unhandled error:", err);
    const message = isDevelopment && err instanceof Error ? err.message : "An unexpected error occurred.";
    return sendError(res, 500, "INTERNAL_ERROR", message);
}
//# sourceMappingURL=error-handler.js.map