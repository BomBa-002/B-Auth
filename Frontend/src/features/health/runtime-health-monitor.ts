/**
 * @file        : Frontend/src/features/health/runtime-health-monitor.ts
 * @description : مراقب خفيف لصحة النظام بعد الإقلاع مع احترام إخفاء الصفحة.
 * @updated     : [{ "date": "27/08/2026", "version": "1.0.0", "by": ["v0"], "comment": "إضافة runtime health monitor" }]
 */

import { checkHealth, type HealthReport } from '@services/health.service'
import { withRetry } from '@features/bootstrap/retry-policy'

export type RuntimeHealthLevel = 'healthy' | 'degraded' | 'critical'

export interface RuntimeHealthState {
  level: RuntimeHealthLevel
  report: HealthReport | null
  error: Error | null
}

/** بيبدأ polling بعد الجاهزية، وبيوقفه تلقائياً وقت إخفاء الصفحة أو unmount. */
export function createRuntimeHealthMonitor(onChange: (state: RuntimeHealthState) => void, intervalMs = 30000) {
  let timer: number | null = null
  let stopped = false
  let running = false

  const poll = async (): Promise<void> => {
    if (stopped || running || document.hidden) return
    running = true
    try {
      const result = await withRetry(() => checkHealth(), { attempts: 2, timeoutMs: 5000 })
      const level: RuntimeHealthLevel = result.value.status === 'ok' ? 'healthy' : 'degraded'
      onChange({ level, report: result.value, error: null })
    } catch (error) {
      onChange({ level: 'critical', report: null, error: error instanceof Error ? error : new Error('Health check failed') })
    } finally {
      running = false
      if (!stopped) timer = window.setTimeout(() => void poll(), intervalMs)
    }
  }

  const handleVisibility = () => { if (!document.hidden) void poll() }
  document.addEventListener('visibilitychange', handleVisibility)
  void poll()

  return () => {
    stopped = true
    if (timer !== null) window.clearTimeout(timer)
    document.removeEventListener('visibilitychange', handleVisibility)
  }
}
