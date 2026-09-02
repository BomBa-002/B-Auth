import { Router } from "express"
import { asyncHandler } from "@middleware/error-handler.js"
import { requireAuth } from "@middleware/auth-guard.js"
import { authRateLimiter } from "@middleware/rate-limit.js"
import { AppError } from "@shared/app-error.js"
import { env } from "@config/env.js"
import { register, login, refresh, logout, me } from "./auth.controller.js"

export const authRouter = Router()

// بوابة التسجيل: مطفية افتراضياً (مطابقة لـ ENABLE_SIGNUP في الواجهة) —
// بتتفتح بس لما ENABLE_REGISTRATION=true في بيئة السيرفر.
authRouter.post("/register", authRateLimiter, (req, _res, next) => {
  if (!env.ENABLE_REGISTRATION) {
    return next(AppError.forbidden("Registration is currently disabled."))
  }
  next()
}, asyncHandler(register))
authRouter.post("/login", authRateLimiter, asyncHandler(login))
authRouter.post("/refresh", authRateLimiter, asyncHandler(refresh))
authRouter.post("/logout", asyncHandler(logout))
authRouter.get("/me", requireAuth, asyncHandler(me))
