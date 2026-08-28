import { apiClient } from '@a'

export interface HealthReport {
  status: "ok" | "degraded"
  uptimeSeconds: number
  checks: {
    dataStore: "ok" | "error"
    storage: "ok" | "degraded" | "error"
  }
}

export async function checkHealth(): Promise<HealthReport> {
  const res = await apiClient.get<{ success: true; data: HealthReport }>("/health")
  return res.data.data
}
