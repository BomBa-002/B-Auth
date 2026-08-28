import { env, isProduction } from "@config/env.js";
export const REFRESH_COOKIE_NAME = "b_auth_refresh";
/**
 * Refresh token lives ONLY in an HttpOnly cookie — never returned in the
 * JSON body, never touched by client JS. The access token is returned in
 * the response body and kept in-memory by the Frontend (Zustand store),
 * never persisted to localStorage.
 */
export function setRefreshCookie(res, token, maxAgeMs) {
    res.cookie(REFRESH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: isProduction || env.COOKIE_SECURE,
        sameSite: "lax",
        domain: env.COOKIE_DOMAIN || undefined,
        path: "/api/auth",
        maxAge: maxAgeMs,
    });
}
export function clearRefreshCookie(res) {
    res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        secure: isProduction || env.COOKIE_SECURE,
        sameSite: "lax",
        domain: env.COOKIE_DOMAIN || undefined,
        path: "/api/auth",
    });
}
//# sourceMappingURL=cookie.util.js.map