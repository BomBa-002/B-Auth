import { sendSuccess } from "@shared/response.js";
import { AppError } from "@shared/app-error.js";
import { uploadObject, getSignedDownloadUrl, deleteObject, isStorageConfigured } from "./storage.service.js";
export async function postUpload(req, res) {
    if (!isStorageConfigured()) {
        throw AppError.internal("Object storage is not configured on this server.");
    }
    const file = req.file;
    if (!file)
        throw AppError.badRequest("No file was provided.");
    const result = await uploadObject(file.buffer, file.originalname, file.mimetype);
    return sendSuccess(res, result, 201);
}
export async function getDownloadUrl(req, res) {
    const url = await getSignedDownloadUrl(req.params.key);
    return sendSuccess(res, { url });
}
export async function removeObject(req, res) {
    await deleteObject(req.params.key);
    return sendSuccess(res, { deleted: true });
}
//# sourceMappingURL=storage.controller.js.map