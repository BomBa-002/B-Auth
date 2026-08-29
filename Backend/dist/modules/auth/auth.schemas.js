import { z } from "zod";
export const loginSchema = z.object({
    identifier: z.string().min(1, "Username or email is required."),
    password: z.string().min(1, "Password is required."),
    rememberMe: z.boolean().optional().default(false),
});
export const registerSchema = z.object({
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
    displayName: z.string().min(1, "Display name is required.").max(64),
});
//# sourceMappingURL=auth.schemas.js.map