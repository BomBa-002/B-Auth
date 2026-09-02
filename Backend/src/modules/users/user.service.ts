import bcrypt from "bcryptjs"
import { nanoid } from "nanoid"
import { AppError } from "@shared/app-error.js"
import { usersRepository, rolesRepository } from "@shared/repositories.js"
import { toPublicUser, type PublicUser, type UserRecord } from "./user.model.js"
import type { CreateUserInput, UpdateUserInput } from "./user.schemas.js"

const BCRYPT_ROUNDS = 10
/** اسم دور الأدمن المدمج — بيتزرع في seed.ts ومش المفروض يتغير. */
const ADMIN_ROLE_NAME = "Admin"

async function getAdminRoleId(): Promise<string | null> {
  const adminRole = await rolesRepository.findOne((r) => r.name === ADMIN_ROLE_NAME)
  return adminRole?.id ?? null
}

/** عدد الأدمن النشطين حالياً — بيُستخدم لمنع قفل النظام بدون أدمن. */
async function countActiveAdmins(adminRoleId: string): Promise<number> {
  const admins = await usersRepository.findMany((u) => u.isActive && u.roleIds.includes(adminRoleId))
  return admins.length
}

/**
 * يمنع أي عملية هتسيب النظام من غير أدمن نشط واحد على الأقل:
 * تعطيل آخر أدمن، أو حذفه، أو تشيل منه دور الأدمن.
 */
async function assertNotLastAdmin(target: UserRecord, nextRoleIds?: string[], nextIsActive?: boolean) {
  const adminRoleId = await getAdminRoleId()
  if (!adminRoleId) return
  if (!target.roleIds.includes(adminRoleId)) return

  const staysAdmin = nextRoleIds ? nextRoleIds.includes(adminRoleId) : true
  const staysActive = nextIsActive ?? target.isActive
  if (staysAdmin && staysActive) return

  const activeAdmins = await countActiveAdmins(adminRoleId)
  if (activeAdmins <= 1) {
    throw AppError.forbidden("Cannot remove the last active admin. Promote another admin first.")
  }
}

/** يتأكد إن كل roleIds المطلوبة موجودة فعلاً قبل الإسناد — عشان مفيش أدوار وهمية تتسند بصمت. */
async function assertRoleIdsExist(roleIds: string[]) {
  if (roleIds.length === 0) return
  const found = await rolesRepository.findMany((r) => roleIds.includes(r.id))
  if (found.length !== roleIds.length) {
    throw AppError.badRequest("One or more of the provided roleIds do not exist.")
  }
}

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

  await assertRoleIdsExist(input.roleIds ?? [])

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

export async function updateUser(id: string, actorId: string, input: UpdateUserInput): Promise<PublicUser> {
  const existing = await usersRepository.findById(id)
  if (!existing) throw AppError.notFound("User not found.")

  // تفرد البريد: مينفعش مستخدم تاني ياخد نفس الإيميل — الـ login بيعتمد على فراديته.
  if (input.email !== undefined) {
    const duplicate = await usersRepository.findOne(
      (u) => u.id !== id && u.email.toLowerCase() === input.email!.toLowerCase()
    )
    if (duplicate) throw AppError.conflict("A user with that email already exists.")
  }

  await assertRoleIdsExist(input.roleIds ?? [])

  // منع تعطيل النفس — الأدمن مش المفروض يعطل نفسه من لوحة الإدارة.
  if (id === actorId && input.isActive === false) {
    throw AppError.forbidden("You cannot deactivate your own account.")
  }

  // منع قفل النظام: آخر أدمن نشط مينفعش يتعطل أو يتشال منه دور الأدمن.
  await assertNotLastAdmin(existing, input.roleIds, input.isActive)

  const patch: Partial<UserRecord> = { updatedAt: new Date().toISOString() }
  if (input.displayName !== undefined) patch.displayName = input.displayName
  if (input.email !== undefined) patch.email = input.email
  if (input.roleIds !== undefined) patch.roleIds = input.roleIds
  if (input.isActive !== undefined) patch.isActive = input.isActive
  if (input.password) patch.passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)

  const updated = await usersRepository.update(id, patch)
  return toPublicUser(updated!)
}

export async function deleteUser(id: string, actorId: string): Promise<void> {
  // منع حذف النفس — لو عايز تمسح حسابك يبقى فيه أدمن تاني يعملها.
  if (id === actorId) {
    throw AppError.forbidden("You cannot delete your own account.")
  }
  const existing = await usersRepository.findById(id)
  if (!existing) throw AppError.notFound("User not found.")

  // منع حذف آخر أدمن نشط في النظام.
  await assertNotLastAdmin(existing)

  const deleted = await usersRepository.delete(id)
  if (!deleted) throw AppError.notFound("User not found.")
}
