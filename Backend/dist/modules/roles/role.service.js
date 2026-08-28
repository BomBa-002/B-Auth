import { nanoid } from "nanoid";
import { AppError } from "@shared/app-error.js";
import { rolesRepository, permissionsRepository, usersRepository } from "@shared/repositories.js";
export async function listRoles() {
    return rolesRepository.findAll();
}
export async function listPermissions() {
    return permissionsRepository.findAll();
}
export async function getRoleById(id) {
    const role = await rolesRepository.findById(id);
    if (!role)
        throw AppError.notFound("Role not found.");
    return role;
}
export async function createRole(input) {
    const existing = await rolesRepository.findOne((r) => r.name.toLowerCase() === input.name.toLowerCase());
    if (existing)
        throw AppError.conflict("A role with that name already exists.");
    const now = new Date().toISOString();
    const role = {
        id: nanoid(),
        name: input.name,
        description: input.description,
        permissionIds: input.permissionIds,
        isSystem: false,
        createdAt: now,
        updatedAt: now,
    };
    await rolesRepository.create(role);
    return role;
}
export async function updateRole(id, input) {
    const existing = await rolesRepository.findById(id);
    if (!existing)
        throw AppError.notFound("Role not found.");
    const patch = { updatedAt: new Date().toISOString() };
    if (input.name !== undefined)
        patch.name = input.name;
    if (input.description !== undefined)
        patch.description = input.description;
    if (input.permissionIds !== undefined)
        patch.permissionIds = input.permissionIds;
    const updated = await rolesRepository.update(id, patch);
    return updated;
}
export async function deleteRole(id) {
    const role = await rolesRepository.findById(id);
    if (!role)
        throw AppError.notFound("Role not found.");
    if (role.isSystem)
        throw AppError.forbidden("System roles cannot be deleted.");
    const usersWithRole = await usersRepository.findOne((u) => u.roleIds.includes(id));
    if (usersWithRole) {
        throw AppError.conflict("Cannot delete a role that is still assigned to users.");
    }
    await rolesRepository.delete(id);
}
//# sourceMappingURL=role.service.js.map