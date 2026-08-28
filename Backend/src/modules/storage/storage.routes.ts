import { Router } from "express"
import multer from "multer"
import { asyncHandler } from "@middleware/error-handler.js"
import { requireAuth, requirePermissions } from "@middleware/auth-guard.js"
import { PERMISSIONS } from "@modules/roles/permission-keys.js"
import { postUpload, getDownloadUrl, removeObject } from "./storage.controller.js"

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

export const storageRouter = Router()

storageRouter.use(requireAuth)

storageRouter.post(
  "/upload",
  requirePermissions(PERMISSIONS.STORAGE_WRITE),
  upload.single("file"),
  asyncHandler(postUpload)
)
storageRouter.get("/:key/url", requirePermissions(PERMISSIONS.STORAGE_READ), asyncHandler(getDownloadUrl))
storageRouter.delete("/:key", requirePermissions(PERMISSIONS.STORAGE_WRITE), asyncHandler(removeObject))
