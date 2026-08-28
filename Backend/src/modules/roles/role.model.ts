export interface PermissionRecord {
  id: string
  key: string // e.g. "users:read", "users:write", "roles:manage"
  description: string
}

export interface RoleRecord {
  id: string
  name: string
  description: string
  permissionIds: string[]
  isSystem: boolean // system roles (admin/user) cannot be deleted
  createdAt: string
  updatedAt: string
}
