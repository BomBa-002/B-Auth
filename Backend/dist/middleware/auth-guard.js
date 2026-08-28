import { AppError } from "@shared/app-error.js";
import { verifyAccessToken } from "@modules/auth/jwt.service.js";
/** Requires a valid `Authorization: Bearer <accessToken>` header. */
export function requireAuth(req, _res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        throw AppError.unauthorized();
    }
    const token = header.slice("Bearer ".length);
    try {
        req.auth = verifyAccessToken(token);
    }
    catch {
        throw AppError.unauthorized("Access token is invalid or expired.");
    }
    next();
}
/** Requires the authenticated user to hold ALL of the given permission keys. */
export function requirePermissions(...permissionKeys) {
    return (req, _res, next) => {
        if (!req.auth)
            throw AppError.unauthorized();
        const hasAll = permissionKeys.every((key) => req.auth.permissions.includes(key));
        if (!hasAll)
            throw AppError.forbidden();
        next();
    };
}
/** Requires the authenticated user to hold at least one of the given roles. */
export function requireRoles(...roleNames) {
    return (req, _res, next) => {
        if (!req.auth)
            throw AppError.unauthorized();
        const hasAny = roleNames.some((role) => req.auth.roles.includes(role));
        if (!hasAny)
            throw AppError.forbidden();
        next();
    };
}
//# sourceMappingURL=auth-guard.js.map