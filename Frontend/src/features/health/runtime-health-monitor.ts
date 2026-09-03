/**
 * @file        : Frontend/src/features/health/runtime-health-monitor.ts
 * @description : مراقب مستمر لصحة النظام بعد الإقلاع — كشف سريع للانقطاع واسترجاع تلقائي عند عودة الخدمة.
 * @updated     : [{ "date": "03/09/2026", "version": "2.0.0", "by": ["v0"], "comment": "فحص متكيّف (بطيء طبيعي/سريع عند الانقطاع) + checkNow لإعادة الفحص الفوري" }]
 */

import { checkHealth, type HealthReport } from '@services/health.service'
import { withRetry } from '@features/bootstrap/retry-policy'

export type RuntimeHealthLevel = 'healthy' | 'degraded' | 'critical'

export interface RuntimeHealthState {
  level: RuntimeHealthLevel
  report: HealthReport | null
  error: Error | null
}

export interface RuntimeHealthMonitorOptions {
  /** الفاصل الطبيعي بين الفحوصات والخدمة سليمة. */
  intervalMs?: number
  /** الفاصل السريع أثناء الانقطاع — عشان الاسترجاع يحصل فور عودة الخدمة. */
  criticalIntervalMs?: number
}

export interface RuntimeHealthMonitorHandle {
  /** بيوقف المراقبة نهائياً (عند unmount). */
  dispose: () => void
  /** فحص فوري بدون انتظار الفاصل الحالي (زر إعادة المحاولة). */
  checkNow: () => void
}

/**
 * بيبدأ polling بعد الجاهزية، وبيوقفه تلقائياً وقت إخفاء الصفحة أو unmount.
 * الفاصل بيتكيّف: طبيعي كل 15 ثانية، وعند الانقطاع كل 4 ثوانٍ عشان أول ما
 * الـ Backend يرجع يشتغل يرجّع المستخدم لشاشته فوراً بدون تدخل يدوي.
 */
export function createRuntimeHealthMonitor(onChange: (state: RuntimeHealthState) => void, options: RuntimeHealthMonitorOptions = {}): RuntimeHealthMonitorHandle {
  const intervalMs = options.intervalMs ?? 15000
  const criticalIntervalMs = options.criticalIntervalMs ?? 4000
  let timer: number | null = null
  let stopped = false
  let running = false
  let lastLevel: RuntimeHealthLevel = 'healthy'

  const schedule = (): void => {
    if (stopped) return
    if (timer !== null) window.clearTimeout(timer)
    timer = window.setTimeout(() => void poll(), lastLevel === 'critical' ? criticalIntervalMs : intervalMs)
  }

  const poll = async (): Promise<void> => {
    if (stopped || running || document.hidden) return
    running = true
    try {
      const result = await withRetry(() => checkHealth(), { attempts: 2, timeoutMs: 5000 })
      const level: RuntimeHealthLevel = result.value.status === 'ok' ? 'healthy' : 'degraded'
      lastLevel = level
      onChange({ level, report: result.value, error: null })
    } catch (error) {
      lastLevel = 'critical'
      onChange({ level: 'critical', report: null, error: error instanceof Error ? error : new Error('Health check failed') })
    } finally {
      running = false
      schedule()
    }
  }

  const handleVisibility = (): void => { if (!document.hidden) void poll() }
  document.addEventListener('visibilitychange', handleVisibility)
  void poll()

  return {
    dispose: () => {
      stopped = true
      if (timer !== null) window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', handleVisibility)
    },
    checkNow: () => {
      if (timer !== null) window.clearTimeout(timer)
      void poll()
    },
  }
}
