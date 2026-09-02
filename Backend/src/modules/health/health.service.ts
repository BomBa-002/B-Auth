/**
 * @file        : Backend/src/modules/health/health.service.ts
 * @description : منطق فحص صحة الخدمة — liveness (العملية شغالة) وreadiness (الاعتماديات جاهزة) منفصلين.
 * @updated     : [{ "date": "02/09/2026", "version": "1.0.0", "by": ["v0"], "comment": "فصل منطق الـ health عن الـ controller وإضافة live/ready" }]
 */

import { checkStorageHealth } from "@modules/storage/storage.service.js"
import { usersRepository } from "@shared/repositories.js"

export type HealthStatus = "ok" | "degraded"

export interface HealthReport {
  status: HealthStatus
  timestamp: string
  uptimeSeconds: number
  checks: {
    /** طبقة البيانات (ملفات JSON حالياً) — لو مش قابلة للقراءة، الخدمة مش جاهزة. */
    dataLayer: { healthy: boolean }
    /** الـ object storage (MinIO/S3) اختياري في التطوير — غيابه ما بيمنعش الـ auth. */
    storage: { configured: boolean; reachable: boolean; error?: string }
  }
}

/**
 * Liveness: العملية شغالة وقادرة تستجيب. ما بيلمسش أي اعتمادية خارجية
 * عشان الـ orchestrator (Docker/K8s) ما يعملش restart بسبب مشكلة في MinIO.
 */
export function getLiveness(): { status: "ok"; uptimeSeconds: number } {
  return { status: "ok", uptimeSeconds: Math.round(process.uptime()) }
}

async function checkDataLayer(): Promise<boolean> {
  try {
    await usersRepository.findAll()
    return true
  } catch {
    return false
  }
}

/**
 * Readiness: التقرير الكامل اللي الـ Frontend بيستهلكه في الـ bootstrap
 * وفي الـ runtime monitor. `degraded` معناها الـ auth مش هيشتغل لأن طبقة
 * البيانات مش متاحة — الـ storage لوحده ما بيغيّرش الحالة العامة.
 */
export async function getReadiness(): Promise<HealthReport> {
  const [dataLayerHealthy, storage] = await Promise.all([checkDataLayer(), checkStorageHealth()])

  return {
    status: dataLayerHealthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    checks: {
      dataLayer: { healthy: dataLayerHealthy },
      storage,
    },
  }
}
