import type { NextFunction, Request, Response } from "express"
import { ZodError } from "zod"
import { AppError } from "@shared/app-error.js"
import { sendError } from "@shared/response.js"
import { isDevelopment } from "@config/env.js"

/** Wraps async route handlers so rejected promises reach the error middleware. */
export function asyncHandler<Req extends Request = Request>(
  fn: (req: Req, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req as Req, res, next).catch(next)
  }
}

export function notFoundHandler(req: Request, res: Response) {
  sendError(res, 404, "NOT_FOUND", `Route ${req.method} ${req.originalUrl} does not exist.`)
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return sendError(res, err.status, err.code, err.message, err.details)
  }

  if (err instanceof ZodError) {
    return sendError(res, 400, "VALIDATION_ERROR", "Request validation failed.", err.flatten())
  }

  console.error("[error-handler] Unhandled error:", err)
  const message = isDevelopment && err instanceof Error ? err.message : "An unexpected error occurred."
  return sendError(res, 500, "INTERNAL_ERROR", message)
}
