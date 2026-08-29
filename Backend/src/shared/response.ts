import type { Response } from "express"

/**
 * Central response envelope — every endpoint returns one of these two shapes
 * so the Frontend's Axios interceptor can rely on a single contract.
 */
export interface SuccessEnvelope<T> {
  success: true
  data: T
  meta?: Record<string, unknown>
}

export interface ErrorEnvelope {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export function sendSuccess<T>(res: Response, data: T, status = 200, meta?: Record<string, unknown>) {
  const body: SuccessEnvelope<T> = { success: true, data, ...(meta ? { meta } : {}) }
  return res.status(status).json(body)
}

export function sendError(res: Response, status: number, code: string, message: string, details?: unknown) {
  const body: ErrorEnvelope = { success: false, error: { code, message, ...(details ? { details } : {}) } }
  return res.status(status).json(body)
}
