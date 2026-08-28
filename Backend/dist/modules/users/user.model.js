export function toPublicUser(user) {
    const { passwordHash: _passwordHash, ...rest } = user;
    return rest;
}
//# sourceMappingURL=user.model.js.map