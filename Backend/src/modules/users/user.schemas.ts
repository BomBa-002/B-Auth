import { z } from "zod"

export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(32, "Username must be at most 32 characters.")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Username may only contain letters, numbers, dots, underscores, and hyphens."),
  email: z.string().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain an uppercase letter.")
    .regex(/[a-z]/, "Password must contain a lowercase letter.")
    .regex(/[0-9]/, "Password must contain a number."),
  displayName: z.string().min(1).max(64),
  roleIds: z.array(z.string()).optional(),
})
export type CreateUserInput = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  displayName: z.string().min(1).max(64).optional(),
  email: z.string().email().optional(),
  roleIds: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain an uppercase letter.")
    .regex(/[a-z]/, "Password must contain a lowercase letter.")
    .regex(/[0-9]/, "Password must contain a number.")
    .optional(),
})
export type UpdateUserInput = z.infer<typeof updateUserSchema>
