import { randomUUID } from "node:crypto"
import bcrypt from "bcryptjs"
import { env } from "@config/env.js"
import { usersRepository, rolesRepository, permissionsRepository } from "@shared/repositories.js"
import { PERMISSIONS } from "@modules/roles/permission-keys.js"
import type { PermissionRecord, RoleRecord } from "@modules/roles/role.model.js"
import type { UserRecord } from "@modules/users/user.model.js"

const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  [PERMISSIONS.USERS_READ]: "View user accounts",
  [PERMISSIONS.USERS_WRITE]: "Create and edit user accounts",
  [PERMISSIONS.USERS_DELETE]: "Delete user accounts",
  [PERMISSIONS.ROLES_MANAGE]: "Create, edit, and assign roles and permissions",
  [PERMISSIONS.STORAGE_READ]: "View stored files",
  [PERMISSIONS.STORAGE_WRITE]: "Upload and delete stored files",
}

/**
 * Populates permissions, the built-in Admin/User roles, and a default admin
 * account the first time the server boots against an empty data directory.
 * Safe to call on every boot — it's a no-op once seed data already exists.
 */
export async function seedIfEmpty(): Promise<void> {
  const now = new Date().toISOString()

  let permissions = await permissionsRepository.findAll()
  if (permissions.length === 0) {
    const records: PermissionRecord[] = Object.values(PERMISSIONS).map((key) => ({
      id: randomUUID(),
      key,
      description: PERMISSION_DESCRIPTIONS[key] ?? key,
    }))
    for (const record of records) await permissionsRepository.create(record)
    permissions = records
    console.log(`[seed] created ${records.length} permissions`)
  }

  const roles = await rolesRepository.findAll()
  let adminRole = roles.find((r) => r.name === "Admin")
  let userRole = roles.find((r) => r.name === "User")

  if (!adminRole) {
    adminRole = {
      id: randomUUID(),
      name: "Admin",
      description: "Full access to all resources and settings",
      permissionIds: permissions.map((p) => p.id),
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    } satisfies RoleRecord
    await rolesRepository.create(adminRole)
    console.log("[seed] created Admin role")
  }

  if (!userRole) {
    const basicPermissionIds = permissions
      .filter((p) => p.key === PERMISSIONS.USERS_READ || p.key === PERMISSIONS.STORAGE_READ)
      .map((p) => p.id)
    userRole = {
      id: randomUUID(),
      name: "User",
      description: "Standard account with read-only access",
      permissionIds: basicPermissionIds,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    } satisfies RoleRecord
    await rolesRepository.create(userRole)
    console.log("[seed] created User role")
  }

  const users = await usersRepository.findAll()
  const adminExists = users.some((u) => u.username === env.SEED_ADMIN_USERNAME)
  if (!adminExists) {
    const passwordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 10)
    const admin: UserRecord = {
      id: randomUUID(),
      username: env.SEED_ADMIN_USERNAME,
      email: env.SEED_ADMIN_EMAIL,
      phone: null,
      passwordHash,
      displayName: "Administrator",
      roleIds: [adminRole.id],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }
    await usersRepository.create(admin)
    console.log(
      `[seed] created default admin user "${env.SEED_ADMIN_USERNAME}" (change the password after first login)`
    )
  }
}
