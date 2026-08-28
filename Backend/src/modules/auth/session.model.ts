export interface SessionRecord {
  id: string
  userId: string
  rememberMe: boolean
  userAgent: string | null
  createdAt: string
  expiresAt: string
  revokedAt: string | null
}
