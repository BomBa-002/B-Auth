import rateLimit from "express-rate-limit"
import { env } from "@config/env.js"
import { sendError } from "@shared/response.js"

/** General API rate limiter — applied to all routes. */
export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, "TOO_MANY_REQUESTS", "Too many requests. Please try again later.")
  },
})

/** Stricter limiter for login/register/refresh — mitigates credential stuffing. */
export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.LOGIN_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, res) => {
    sendError(res, 429, "TOO_MANY_REQUESTS", "Too many attempts. Please wait before trying again.")
  },
})
