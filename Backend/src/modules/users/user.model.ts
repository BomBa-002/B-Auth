export interface UserRecord {
  id: string
  username: string
  email: string
  passwordHash: string
  displayName: string
  roleIds: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/** Shape returned to clients — never leaks `passwordHash`. */
export type PublicUser = Omit<UserRecord, "passwordHash">

export function toPublicUser(user: UserRecord): PublicUser {
  const { passwordHash: _passwordHash, ...rest } = user
  return rest
}
