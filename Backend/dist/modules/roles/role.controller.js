import { sendSuccess } from "@shared/response.js";
import { createRoleSchema, updateRoleSchema } from "./role.schemas.js";
import { listRoles, listPermissions, getRoleById, createRole, updateRole, deleteRole } from "./role.service.js";
export async function getRoles(_req, res) {
    const roles = await listRoles();
    return sendSuccess(res, { roles });
}
export async function getPermissions(_req, res) {
    const permissions = await listPermissions();
    return sendSuccess(res, { permissions });
}
export async function getRole(req, res) {
    const role = await getRoleById(req.params.id);
    return sendSuccess(res, { role });
}
export async function postRole(req, res) {
    const input = createRoleSchema.parse(req.body);
    const role = await createRole(input);
    return sendSuccess(res, { role }, 201);
}
export async function patchRole(req, res) {
    const input = updateRoleSchema.parse(req.body);
    const role = await updateRole(req.params.id, input);
    return sendSuccess(res, { role });
}
export async function removeRole(req, res) {
    await deleteRole(req.params.id);
    return sendSuccess(res, { deleted: true });
}
//# sourceMappingURL=role.controller.js.map