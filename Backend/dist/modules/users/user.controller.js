import { sendSuccess } from "@shared/response.js";
import { createUserSchema, updateUserSchema } from "./user.schemas.js";
import { listUsers, getUserById, createUser, updateUser, deleteUser } from "./user.service.js";
export async function getUsers(_req, res) {
    const users = await listUsers();
    return sendSuccess(res, { users });
}
export async function getUser(req, res) {
    const user = await getUserById(req.params.id);
    return sendSuccess(res, { user });
}
export async function postUser(req, res) {
    const input = createUserSchema.parse(req.body);
    const user = await createUser(input);
    return sendSuccess(res, { user }, 201);
}
export async function patchUser(req, res) {
    const input = updateUserSchema.parse(req.body);
    const user = await updateUser(req.params.id, input);
    return sendSuccess(res, { user });
}
export async function removeUser(req, res) {
    await deleteUser(req.params.id);
    return sendSuccess(res, { deleted: true });
}
//# sourceMappingURL=user.controller.js.map