import { Router } from "express";
import { asyncHandler } from "@middleware/error-handler.js";
import { requireAuth, requirePermissions } from "@middleware/auth-guard.js";
import { PERMISSIONS } from "@modules/roles/permission-keys.js";
import { getUsers, getUser, postUser, patchUser, removeUser } from "./user.controller.js";
export const userRouter = Router();
userRouter.use(requireAuth);
userRouter.get("/", requirePermissions(PERMISSIONS.USERS_READ), asyncHandler(getUsers));
userRouter.get("/:id", requirePermissions(PERMISSIONS.USERS_READ), asyncHandler(getUser));
userRouter.post("/", requirePermissions(PERMISSIONS.USERS_WRITE), asyncHandler(postUser));
userRouter.patch("/:id", requirePermissions(PERMISSIONS.USERS_WRITE), asyncHandler(patchUser));
userRouter.delete("/:id", requirePermissions(PERMISSIONS.USERS_DELETE), asyncHandler(removeUser));
//# sourceMappingURL=user.routes.js.map