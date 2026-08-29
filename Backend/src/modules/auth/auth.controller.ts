import type { Request, Response } from "express"
import { sendSuccess } from "@shared/response.js"
import { loginSchema, registerSchema } from "./auth.schemas.js"
import { loginUser, registerUser, refreshSession, logoutSession, getCurrentUser } from "./auth.service.js"
import { setRefreshCookie, clearRefreshCookie, REFRESH_COOKIE_NAME } from "./cookie.util.js"

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body)
  const user = await registerUser(input)
  return sendSuccess(res, { user }, 201)
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body)
  const userAgent = req.headers["user-agent"] ?? null
  const { user, accessToken, refreshToken, refreshTtlMs, roleNames, permissionKeys } = await loginUser(input, userAgent)

  setRefreshCookie(res, refreshToken, refreshTtlMs)
  return sendSuccess(res, {
    user,
    accessToken,
    roles: roleNames,
    permissions: permissionKeys,
  })
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined
  if (!refreshToken) {
    // غياب الكوكي عند أول زيارة حالة طبيعية لمستخدم غير مسجل الدخول.
    return res.status(204).send()
  }
  const userAgent = req.headers["user-agent"] ?? null
  const { user, accessToken, refreshToken: newRefreshToken, refreshTtlMs, roleNames, permissionKeys } =
    await refreshSession(refreshToken, userAgent)

  setRefreshCookie(res, newRefreshToken, refreshTtlMs)
  return sendSuccess(res, {
    user,
    accessToken,
    roles: roleNames,
    permissions: permissionKeys,
  })
}

export async function logout(req: Request, res: Response) {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined
  await logoutSession(refreshToken)
  clearRefreshCookie(res)
  return sendSuccess(res, { loggedOut: true })
}

export async function me(req: Request, res: Response) {
  const user = await getCurrentUser(req.auth!.sub)
  return sendSuccess(res, {
    user,
    roles: req.auth!.roles,
    permissions: req.auth!.permissions,
  })
}
