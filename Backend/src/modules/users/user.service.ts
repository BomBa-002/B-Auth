import bcrypt from "bcryptjs"
import { nanoid } from "nanoid"
import { AppError } from "@shared/app-error.js"
import { usersRepository } from "@shared/repositories.js"
import { toPublicUser, type PublicUser, type UserRecord } from "./user.model.js"
import type { CreateUserInput, UpdateUserInput } from "./user.schemas.js"

const BCRYPT_ROUNDS = 10

export async function listUsers(): Promise<PublicUser[]> {
  const users = await usersRepository.findAll()
  return users.map(toPublicUser)
}

export async function getUserById(id: string): Promise<PublicUser> {
  const user = await usersRepository.findById(id)
  if (!user) throw AppError.notFound("User not found.")
  return toPublicUser(user)
}

export async function createUser(input: CreateUserInput): Promise<PublicUser> {
  const existing = await usersRepository.findOne(
    (u) => u.username.toLowerCase() === input.username.toLowerCase() || u.email.toLowerCase() === input.email.toLowerCase()
  )
  if (existing) throw AppError.conflict("A user with that username or email already exists.")

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)
  const now = new Date().toISOString()
  const user: UserRecord = {
    id: nanoid(),
    username: input.username,
    email: input.email,
    phone: null,
    passwordHash,
    displayName: input.displayName,
    roleIds: input.roleIds ?? [],
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }
  await usersRepository.create(user)
  return toPublicUser(user)
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<PublicUser> {
  const existing = await usersRepository.findById(id)
  if (!existing) throw AppError.notFound("User not found.")

  const patch: Partial<UserRecord> = { updatedAt: new Date().toISOString() }
  if (input.displayName !== undefined) patch.displayName = input.displayName
  if (input.email !== undefined) patch.email = input.email
  if (input.roleIds !== undefined) patch.roleIds = input.roleIds
  if (input.isActive !== undefined) patch.isActive = input.isActive
  if (input.password) patch.passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)

  const updated = await usersRepository.update(id, patch)
  return toPublicUser(updated!)
}

export async function deleteUser(id: string): Promise<void> {
  const deleted = await usersRepository.delete(id)
  if (!deleted) throw AppError.notFound("User not found.")
}
