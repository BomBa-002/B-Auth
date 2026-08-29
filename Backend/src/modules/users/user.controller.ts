import type { Request, Response } from "express"
import { sendSuccess } from "@shared/response.js"
import { createUserSchema, updateUserSchema } from "./user.schemas.js"
import { listUsers, getUserById, createUser, updateUser, deleteUser } from "./user.service.js"

export async function getUsers(_req: Request, res: Response) {
  const users = await listUsers()
  return sendSuccess(res, { users })
}

export async function getUser(req: Request, res: Response) {
  const user = await getUserById(req.params.id as string)
  return sendSuccess(res, { user })
}

export async function postUser(req: Request, res: Response) {
  const input = createUserSchema.parse(req.body)
  const user = await createUser(input)
  return sendSuccess(res, { user }, 201)
}

export async function patchUser(req: Request, res: Response) {
  const input = updateUserSchema.parse(req.body)
  const user = await updateUser(req.params.id as string, input)
  return sendSuccess(res, { user })
}

export async function removeUser(req: Request, res: Response) {
  await deleteUser(req.params.id as string)
  return sendSuccess(res, { deleted: true })
}
