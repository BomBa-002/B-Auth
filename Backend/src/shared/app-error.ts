/**
 * Typed application error — thrown from anywhere in a request lifecycle and
 * caught by the central error-handling middleware (`middleware/error-handler.ts`),
 * which maps it onto the `ErrorEnvelope` response shape.
 */
export class AppError extends Error {
  public readonly status: number
  public readonly code: string
  public readonly details?: unknown

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.name = "AppError"
    this.status = status
    this.code = code
    this.details = details
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, "BAD_REQUEST", message, details)
  }
  static unauthorized(message = "Authentication required.") {
    return new AppError(401, "UNAUTHORIZED", message)
  }
  static forbidden(message = "You do not have permission to perform this action.") {
    return new AppError(403, "FORBIDDEN", message)
  }
  static notFound(message = "Resource not found.") {
    return new AppError(404, "NOT_FOUND", message)
  }
  static conflict(message: string, details?: unknown) {
    return new AppError(409, "CONFLICT", message, details)
  }
  static tooManyRequests(message = "Too many requests. Please try again later.") {
    return new AppError(429, "TOO_MANY_REQUESTS", message)
  }
  static internal(message = "An unexpected error occurred.") {
    return new AppError(500, "INTERNAL_ERROR", message)
  }
}
