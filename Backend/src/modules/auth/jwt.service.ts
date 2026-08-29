import jwt from "jsonwebtoken"
import { env } from "@config/env.js"

export interface AccessTokenPayload {
  sub: string // user id
  username: string
  roles: string[]
  permissions: string[]
}

export interface RefreshTokenPayload {
  sub: string // user id
  sessionId: string
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: jwt.SignOptions = { expiresIn: env.JWT_ACCESS_TTL as jwt.SignOptions["expiresIn"] }
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options)
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload
}

export function signRefreshToken(payload: RefreshTokenPayload, rememberMe: boolean): string {
  const ttl = rememberMe ? env.JWT_REFRESH_TTL_REMEMBER : env.JWT_REFRESH_TTL_SESSION
  const options: jwt.SignOptions = { expiresIn: ttl as jwt.SignOptions["expiresIn"] }
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options)
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload
}

/** Converts a jsonwebtoken TTL string ("15m", "1d", "30d") to milliseconds for cookie maxAge. */
export function ttlToMs(ttl: string): number {
  const match = /^(\d+)([smhd])$/.exec(ttl)
  if (!match) return 15 * 60 * 1000
  const value = Number(match[1])
  const unit = match[2]
  const multipliers: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }
  return value * (multipliers[unit as string] ?? 60_000)
}
