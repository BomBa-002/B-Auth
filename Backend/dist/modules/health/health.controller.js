import { sendSuccess } from "@shared/response.js";
import { checkStorageHealth } from "@modules/storage/storage.service.js";
import { usersRepository } from "@shared/repositories.js";
/**
 * Readiness/liveness endpoint consumed by the Frontend bootstrap state
 * machine before it ever shows a login screen. Distinguishes "data layer
 * reachable" (JSON files always readable) from "storage reachable" (MinIO —
 * optional in this sandbox) so a missing object-storage server never blocks
 * auth.
 */
export async function getHealth(_req, res) {
    let dataLayerHealthy = true;
    try {
        await usersRepository.findAll();
    }
    catch {
        dataLayerHealthy = false;
    }
    const storage = await checkStorageHealth();
    const status = dataLayerHealthy ? "ok" : "degraded";
    return sendSuccess(res, {
        status,
        timestamp: new Date().toISOString(),
        checks: {
            dataLayer: { healthy: dataLayerHealthy },
            storage,
        },
    });
}
//# sourceMappingURL=health.controller.js.map