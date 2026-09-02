import bcrypt from "bcryptjs"
import { nanoid } from "nanoid"
import { AppError } from "@shared/app-error.js"
import { usersRepository, rolesRepository, permissionsRepository, sessionsRepository } from "@shared/repositories.js"
import type { UserRecord } from "@modules/users/user.model.js"
import { toPublicUser, type PublicUser } from "@modules/users/user.model.js"
import type { LoginInput, RegisterInput } from "./auth.schemas.js"
import { signAccessToken, signRefreshToken, verifyRefreshToken, ttlToMs } from "./jwt.service.js"
import { env } from "@config/env.js"

const BCRYPT_ROUNDS = 10
/** نافذة سماح الـ rotation بالمللي ثانية — بتغطي سباق التابات المتزامنة فقط. */
const REFRESH_GRACE_MS = 30_000

async function resolveRolesAndPermissions(roleIds: string[]) {
  const roles = await rolesRepository.findMany((r) => roleIds.includes(r.id))
  const permissionIds = [...new Set(roles.flatMap((r) => r.permissionIds))]
  const permissions = await permissionsRepository.findMany((p) => permissionIds.includes(p.id))
  return {
    roleNames: roles.map((r) => r.name),
    permissionKeys: permissions.map((p) => p.key),
  }
}

async function buildAuthTokens(user: UserRecord, rememberMe: boolean, userAgent: string | null) {
  const { roleNames, permissionKeys } = await resolveRolesAndPermissions(user.roleIds)

  const accessToken = signAccessToken({
    sub: user.id,
    username: user.username,
    roles: roleNames,
    permissions: permissionKeys,
  })

  const sessionId = nanoid()
  const ttlMs = rememberMe ? ttlToMs(env.JWT_REFRESH_TTL_REMEMBER) : ttlToMs(env.JWT_REFRESH_TTL_SESSION)
  const now = new Date()
  await sessionsRepository.create({
    id: sessionId,
    userId: user.id,
    rememberMe,
    userAgent,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + ttlMs).toISOString(),
    revokedAt: null,
    graceUntil: null,
  })

  const refreshToken = signRefreshToken({ sub: user.id, sessionId }, rememberMe)

  return { accessToken, refreshToken, refreshTtlMs: ttlMs, roleNames, permissionKeys }
}

export async function registerUser(input: RegisterInput): Promise<PublicUser> {
  const existing = await usersRepository.findOne(
    (u) =>
      u.username.toLowerCase() === input.username.toLowerCase() ||
      u.email.toLowerCase() === input.email.toLowerCase() ||
      (input.phone !== null && u.phone !== null && u.phone === input.phone)
  )
  if (existing) {
    throw AppError.conflict("A user with that username, email or phone already exists.")
  }

  const defaultRole = await rolesRepository.findOne((r) => r.name === "user")
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)
  const now = new Date().toISOString()

  const user: UserRecord = {
    id: nanoid(),
    username: input.username,
    email: input.email,
    phone: input.phone,
    passwordHash,
    displayName: input.displayName,
    roleIds: defaultRole ? [defaultRole.id] : [],
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }

  await usersRepository.create(user)
  return toPublicUser(user)
}

export async function loginUser(input: LoginInput, userAgent: string | null) {
  const identifier = input.identifier.trim().toLowerCase()
  // مطابقة الجوال بالأرقام فقط عشان تلاقي الفرق بين "+20 100..." و "+20100...".
  const phoneDigits = identifier.replace(/\D/g, "")
  const user = await usersRepository.findOne(
    (u) =>
      u.username.toLowerCase() === identifier ||
      u.email.toLowerCase() === identifier ||
      (phoneDigits.length >= 7 && (u.phone ?? "").replace(/\D/g, "") === phoneDigits)
  )
  if (!user || !user.isActive) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Incorrect username/email/phone or password.")
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash)
  if (!passwordMatches) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Incorrect username/email/phone or password.")
  }

  const tokens = await buildAuthTokens(user, input.rememberMe, userAgent)
  return { user: toPublicUser(user), ...tokens }
}

export async function refreshSession(refreshToken: string, userAgent: string | null) {
  let payload: { sub: string; sessionId: string }
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "Session expired. Please sign in again.")
  }

  const session = await sessionsRepository.findById(payload.sessionId)
  if (!session || new Date(session.expiresAt) < new Date()) {
    throw new AppError(401, "SESSION_EXPIRED", "Session expired. Please sign in again.")
  }

  // نافذة سماح قصيرة (30 ثانية) للجلسات اللي اتعملها revoke بسبب الـ rotation:
  // لو تابين عملوا refresh في نفس اللحظة بنفس الكوكي، التاني بيجدد عادي
  // بدل ما ياخد 401 ويتعمله logout مفاجئ. الـ logout الصريح بيمسح الـ grace
  // فالجلسة الملغاة يدوياً بتفضل ميتة فوراً.
  const isRevoked = session.revokedAt !== null
  const inGrace = session.graceUntil !== null && new Date(session.graceUntil) > new Date()
  if (isRevoked && !inGrace) {
    throw new AppError(401, "SESSION_EXPIRED", "Session expired. Please sign in again.")
  }

  const user = await usersRepository.findById(payload.sub)
  if (!user || !user.isActive) {
    throw new AppError(401, "SESSION_EXPIRED", "Session expired. Please sign in again.")
  }

  // Rotate: revoke the old session, issue a new one with the same rememberMe policy.
  // الـ grace بيتفعّل هنا فقط (rotation) — مش في الـ logout.
  const revokedAt = new Date()
  await sessionsRepository.update(session.id, {
    revokedAt: revokedAt.toISOString(),
    graceUntil: new Date(revokedAt.getTime() + REFRESH_GRACE_MS).toISOString(),
  })
  const tokens = await buildAuthTokens(user, session.rememberMe, userAgent)
  return { user: toPublicUser(user), ...tokens }
}

export async function logoutSession(refreshToken: string | undefined) {
  if (!refreshToken) return
  try {
    const payload = verifyRefreshToken(refreshToken)
    // الـ logout بيمسح الـ grace صراحةً — عشان الجلسة تموت فوراً بدون أي نافذة سماح.
    await sessionsRepository.update(payload.sessionId, { revokedAt: new Date().toISOString(), graceUntil: null })
  } catch {
    // token already invalid/expired — nothing to revoke
  }
}

export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const user = await usersRepository.findById(userId)
  if (!user) throw AppError.notFound("User not found.")
  return toPublicUser(user)
}
