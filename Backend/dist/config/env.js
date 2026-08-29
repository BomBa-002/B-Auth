import { z } from "zod";
import "dotenv/config";
/**
 * Validated environment configuration. Fails fast at boot with a readable
 * message instead of surfacing undefined-var bugs deep in request handlers.
 */
const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    CORS_ORIGIN: z.string().default("http://localhost:3000"),
    JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 characters"),
    JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 characters"),
    JWT_ACCESS_TTL: z.string().default("15m"),
    JWT_REFRESH_TTL_SESSION: z.string().default("1d"),
    JWT_REFRESH_TTL_REMEMBER: z.string().default("30d"),
    COOKIE_DOMAIN: z.string().optional(),
    COOKIE_SECURE: z
        .string()
        .default("false")
        .transform((v) => v === "true"),
    DATA_DIR: z.string().default("./data"),
    S3_ENDPOINT: z.string().optional(),
    S3_REGION: z.string().default("us-east-1"),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_BUCKET: z.string().default("b-auth-storage"),
    S3_FORCE_PATH_STYLE: z
        .string()
        .default("true")
        .transform((v) => v === "true"),
    SEED_ADMIN_USERNAME: z.string().default("admin"),
    SEED_ADMIN_PASSWORD: z.string().default("Admin123!"),
    SEED_ADMIN_EMAIL: z.string().email().default("admin@b-auth.local"),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
});
function loadEnv() {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
        console.error("[env] Invalid environment configuration:");
        for (const issue of parsed.error.issues) {
            console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
        }
        process.exit(1);
    }
    return parsed.data;
}
export const env = loadEnv();
export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
//# sourceMappingURL=env.js.map