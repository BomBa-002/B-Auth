import type { Request, Response } from "express"
import { sendSuccess } from "@shared/response.js"
import { createRoleSchema, updateRoleSchema } from "./role.schemas.js"
import { listRoles, listPermissions, getRoleById, createRole, updateRole, deleteRole } from "./role.service.js"

export async function getRoles(_req: Request, res: Response) {
  const roles = await listRoles()
  return sendSuccess(res, { roles })
}

export async function getPermissions(_req: Request, res: Response) {
  const permissions = await listPermissions()
  return sendSuccess(res, { permissions })
}

export async function getRole(req: Request, res: Response) {
  const role = await getRoleById(req.params.id as string)
  return sendSuccess(res, { role })
}

export async function postRole(req: Request, res: Response) {
  const input = createRoleSchema.parse(req.body)
  const role = await createRole(input)
  return sendSuccess(res, { role }, 201)
}

export async function patchRole(req: Request, res: Response) {
  const input = updateRoleSchema.parse(req.body)
  const role = await updateRole(req.params.id as string, input)
  return sendSuccess(res, { role })
}

export async function removeRole(req: Request, res: Response) {
  await deleteRole(req.params.id as string)
  return sendSuccess(res, { deleted: true })
}
