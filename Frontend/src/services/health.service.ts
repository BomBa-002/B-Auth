import { apiClient } from '@a'

/** تقرير الجاهزية الكامل — مطابق لـ Backend/src/modules/health/health.service.ts */
export interface HealthReport {
  status: "ok" | "degraded"
  timestamp: string
  uptimeSeconds: number
  checks: {
    /** طبقة البيانات (ملفات JSON حالياً) — لو مش متاحة، الـ auth مش هيشتغل. */
    dataLayer: { healthy: boolean }
    /** الـ object storage (MinIO/S3) اختياري في التطوير. */
    storage: { configured: boolean; reachable: boolean; error?: string }
  }
}

export interface LivenessReport {
  status: "ok"
  uptimeSeconds: number
}

/** GET /api/health — تقرير الجاهزية الكامل (بيستهلك في الـ bootstrap والـ runtime monitor). */
export async function checkHealth(): Promise<HealthReport> {
  const res = await apiClient.get<{ success: true; data: HealthReport }>("/health")
  return res.data.data
}

/** GET /api/health/live — هل العملية شغالة؟ (للـ orchestrator، بدون لمس اعتماديات). */
export async function checkLiveness(): Promise<LivenessReport> {
  const res = await apiClient.get<{ success: true; data: LivenessReport }>("/health/live")
  return res.data.data
}

/** GET /api/health/ready — هل الاعتماديات جاهزة؟ (للـ orchestrator). */
export async function checkReadiness(): Promise<HealthReport> {
  const res = await apiClient.get<{ success: true; data: HealthReport }>("/health/ready")
  return res.data.data
}
