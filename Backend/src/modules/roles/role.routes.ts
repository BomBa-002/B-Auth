import { Router } from "express"
import { asyncHandler } from "@middleware/error-handler.js"
import { requireAuth, requirePermissions } from "@middleware/auth-guard.js"
import { PERMISSIONS } from "./permission-keys.js"
import { getRoles, getPermissions, getRole, postRole, patchRole, removeRole } from "./role.controller.js"

export const roleRouter = Router()

roleRouter.use(requireAuth)

roleRouter.get("/", requirePermissions(PERMISSIONS.ROLES_MANAGE), asyncHandler(getRoles))
roleRouter.get("/permissions", requirePermissions(PERMISSIONS.ROLES_MANAGE), asyncHandler(getPermissions))
roleRouter.get("/:id", requirePermissions(PERMISSIONS.ROLES_MANAGE), asyncHandler(getRole))
roleRouter.post("/", requirePermissions(PERMISSIONS.ROLES_MANAGE), asyncHandler(postRole))
roleRouter.patch("/:id", requirePermissions(PERMISSIONS.ROLES_MANAGE), asyncHandler(patchRole))
roleRouter.delete("/:id", requirePermissions(PERMISSIONS.ROLES_MANAGE), asyncHandler(removeRole))
