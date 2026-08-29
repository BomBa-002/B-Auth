import { Router } from "express";
import { asyncHandler } from "@middleware/error-handler.js";
import { requireAuth } from "@middleware/auth-guard.js";
import { authRateLimiter } from "@middleware/rate-limit.js";
import { register, login, refresh, logout, me } from "./auth.controller.js";
export const authRouter = Router();
authRouter.post("/register", authRateLimiter, asyncHandler(register));
authRouter.post("/login", authRateLimiter, asyncHandler(login));
authRouter.post("/refresh", authRateLimiter, asyncHandler(refresh));
authRouter.post("/logout", asyncHandler(logout));
authRouter.get("/me", requireAuth, asyncHandler(me));
//# sourceMappingURL=auth.routes.js.map