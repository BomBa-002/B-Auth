/**
 * Canonical permission keys. Both the seed data and route guards reference
 * these constants so a typo can't silently create an unenforced permission.
 */
export const PERMISSIONS = {
  USERS_READ: "users:read",
  USERS_WRITE: "users:write",
  USERS_DELETE: "users:delete",
  ROLES_MANAGE: "roles:manage",
  STORAGE_READ: "storage:read",
  STORAGE_WRITE: "storage:write",
} as const

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
