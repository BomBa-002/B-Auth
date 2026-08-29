export function sendSuccess(res, data, status = 200, meta) {
    const body = { success: true, data, ...(meta ? { meta } : {}) };
    return res.status(status).json(body);
}
export function sendError(res, status, code, message, details) {
    const body = { success: false, error: { code, message, ...(details ? { details } : {}) } };
    return res.status(status).json(body);
}
//# sourceMappingURL=response.js.map