import type { NextFunction, Request, Response } from "express"
import { AppError } from "@shared/app-error.js"
import { verifyAccessToken, type AccessTokenPayload } from "@modules/auth/jwt.service.js"

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AccessTokenPayload
    }
  }
}

/** Requires a valid `Authorization: Bearer <accessToken>` header. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith("Bearer ")) {
    throw AppError.unauthorized()
  }
  const token = header.slice("Bearer ".length)
  try {
    req.auth = verifyAccessToken(token)
  } catch {
    throw AppError.unauthorized("Access token is invalid or expired.")
  }
  next()
}

/** Requires the authenticated user to hold ALL of the given permission keys. */
export function requirePermissions(...permissionKeys: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) throw AppError.unauthorized()
    const hasAll = permissionKeys.every((key) => req.auth!.permissions.includes(key))
    if (!hasAll) throw AppError.forbidden()
    next()
  }
}

/** Requires the authenticated user to hold at least one of the given roles. */
export function requireRoles(...roleNames: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) throw AppError.unauthorized()
    const hasAny = roleNames.some((role) => req.auth!.roles.includes(role))
    if (!hasAny) throw AppError.forbidden()
    next()
  }
}
