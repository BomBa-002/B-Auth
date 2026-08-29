import { apiClient, type AuthUser } from '@a'

export interface LoginPayload {
  /** Username or email — the backend accepts either as a single identifier. */
  identifier: string
  password: string
  rememberMe: boolean
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  displayName: string
}

/** Raw envelope shape from the backend: role/permission names live beside `user`, not inside it. */
interface RawSessionData {
  user: Omit<AuthUser, "roles" | "permissions">
  accessToken: string
  roles: string[]
  permissions: string[]
}

export interface SessionResponse {
  accessToken: string
  user: AuthUser
  persistent: boolean
}

function toSessionResponse(raw: RawSessionData, persistent: boolean): SessionResponse {
  return {
    accessToken: raw.accessToken,
    persistent,
    user: { ...raw.user, roles: raw.roles, permissions: raw.permissions },
  }
}

/** `POST /auth/register` only ever returns the created (public) user — no session/cookie is issued. */
export interface RegisteredUser {
  id: string
  username: string
  email: string
  displayName: string
}

interface Envelope<T> {
  success: true
  data: T
}

export async function login(payload: LoginPayload): Promise<SessionResponse> {
  const res = await apiClient.post<Envelope<RawSessionData>>("/auth/login", payload)
  return toSessionResponse(res.data.data, payload.rememberMe)
}

export async function register(payload: RegisterPayload): Promise<RegisteredUser> {
  const res = await apiClient.post<Envelope<{ user: RegisteredUser }>>("/auth/register", payload)
  return res.data.data.user
}

/**
 * Restores a session from the HttpOnly refresh cookie. The backend rotates
 * the cookie but doesn't echo back whether the original login "remembered"
 * this device, so callers that need to preserve that flag across reloads
 * should track it themselves (e.g. via a non-sensitive persisted hint).
 */
export async function refresh(): Promise<SessionResponse | null> {
  const res = await apiClient.post<Envelope<RawSessionData> | undefined>("/auth/refresh")
  if (res.status === 204 || !res.data) return null
  return toSessionResponse(res.data.data, true)
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout")
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const res = await apiClient.get<Envelope<Omit<RawSessionData, "accessToken">>>("/auth/me")
  const { user, roles, permissions } = res.data.data
  return { ...user, roles, permissions }
}
