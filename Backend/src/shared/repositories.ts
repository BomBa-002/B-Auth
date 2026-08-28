import { JsonRepository } from "./json-repository.js"
import type { UserRecord } from "@modules/users/user.model.js"
import type { RoleRecord, PermissionRecord } from "@modules/roles/role.model.js"
import type { SessionRecord } from "@modules/auth/session.model.js"

/**
 * Single shared repository instances — imported by services across modules.
 * Each wraps one JSON file under `DATA_DIR`.
 */
export const usersRepository = new JsonRepository<UserRecord>("users.json")
export const rolesRepository = new JsonRepository<RoleRecord>("roles.json")
export const permissionsRepository = new JsonRepository<PermissionRecord>("permissions.json")
export const sessionsRepository = new JsonRepository<SessionRecord>("sessions.json")
