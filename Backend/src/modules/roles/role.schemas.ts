import { z } from "zod"

export const createRoleSchema = z.object({
  name: z.string().min(2).max(32),
  description: z.string().min(1).max(200),
  permissionIds: z.array(z.string()).default([]),
})
export type CreateRoleInput = z.infer<typeof createRoleSchema>

export const updateRoleSchema = z.object({
  name: z.string().min(2).max(32).optional(),
  description: z.string().min(1).max(200).optional(),
  permissionIds: z.array(z.string()).optional(),
})
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
