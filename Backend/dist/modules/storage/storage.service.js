import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";
import { env } from "@config/env.js";
import { AppError } from "@shared/app-error.js";
/**
 * MinIO/S3-compatible object storage module. Runs in "degraded" mode when
 * S3 credentials are not configured (e.g. this sandbox has no MinIO server
 * reachable) — `isStorageConfigured()` lets the health module report this
 * accurately instead of crashing the whole API.
 */
export function isStorageConfigured() {
    return Boolean(env.S3_ENDPOINT && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY);
}
let client = null;
function getClient() {
    if (!isStorageConfigured()) {
        throw AppError.internal("Object storage is not configured on this server.");
    }
    if (!client) {
        client = new S3Client({
            endpoint: env.S3_ENDPOINT,
            region: env.S3_REGION,
            forcePathStyle: env.S3_FORCE_PATH_STYLE,
            credentials: {
                accessKeyId: env.S3_ACCESS_KEY_ID,
                secretAccessKey: env.S3_SECRET_ACCESS_KEY,
            },
        });
    }
    return client;
}
export async function checkStorageHealth() {
    if (!isStorageConfigured())
        return { configured: false, reachable: false };
    try {
        await getClient().send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }));
        return { configured: true, reachable: true };
    }
    catch (err) {
        return { configured: true, reachable: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
}
export async function uploadObject(buffer, originalName, mimeType) {
    const key = `${nanoid()}-${originalName}`;
    await getClient().send(new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: key, Body: buffer, ContentType: mimeType }));
    return { key };
}
export async function getSignedDownloadUrl(key) {
    const command = new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key });
    return getSignedUrl(getClient(), command, { expiresIn: 3600 });
}
export async function deleteObject(key) {
    await getClient().send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
}
//# sourceMappingURL=storage.service.js.map