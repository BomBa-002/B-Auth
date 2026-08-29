import jwt from "jsonwebtoken";
import { env } from "@config/env.js";
export function signAccessToken(payload) {
    const options = { expiresIn: env.JWT_ACCESS_TTL };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}
export function verifyAccessToken(token) {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
}
export function signRefreshToken(payload, rememberMe) {
    const ttl = rememberMe ? env.JWT_REFRESH_TTL_REMEMBER : env.JWT_REFRESH_TTL_SESSION;
    const options = { expiresIn: ttl };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
}
export function verifyRefreshToken(token) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
}
/** Converts a jsonwebtoken TTL string ("15m", "1d", "30d") to milliseconds for cookie maxAge. */
export function ttlToMs(ttl) {
    const match = /^(\d+)([smhd])$/.exec(ttl);
    if (!match)
        return 15 * 60 * 1000;
    const value = Number(match[1]);
    const unit = match[2];
    const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
    return value * (multipliers[unit] ?? 60_000);
}
//# sourceMappingURL=jwt.service.js.map