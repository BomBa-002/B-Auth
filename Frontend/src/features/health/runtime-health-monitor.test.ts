/**
 * @file        : Frontend/src/features/health/runtime-health-monitor.test.ts
 * @description : اختبارات المراقب المستمر لصحة النظام — كشف الانقطاع والاسترجاع التلقائي.
 * @updated     : [{ "date": "03/09/2026", "version": "1.0.0", "by": ["v0"], "comment": "اختبارات الفحص المتكيّف والاسترجاع" }]
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createRuntimeHealthMonitor } from './runtime-health-monitor'
import { checkHealth, type HealthReport } from '@services/health.service'

vi.mock('@services/health.service', () => ({ checkHealth: vi.fn() }))

const mockCheckHealth = vi.mocked(checkHealth)

const healthyReport: HealthReport = {
  status: 'ok',
  timestamp: new Date().toISOString(),
  uptimeSeconds: 10,
  checks: { dataLayer: { healthy: true }, storage: { configured: true, reachable: true } },
}

describe('createRuntimeHealthMonitor', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockCheckHealth.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('بيتحول لحالة حرجة عند فشل الفحص ويعيد المحاولة بفاصل سريع', async () => {
    mockCheckHealth.mockRejectedValue(new Error('Network Error'))
    const onChange = vi.fn()
    const monitor = createRuntimeHealthMonitor(onChange, { intervalMs: 15000, criticalIntervalMs: 4000 })

    // فحص أولي فاشل (محاولتين + مهلة + backoff).
    await vi.advanceTimersByTimeAsync(12000)
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ level: 'critical' }))

    // الفاصل السريع (4 ثوانٍ) مش الطبيعي (15 ثانية).
    mockCheckHealth.mockResolvedValue(healthyReport)
    await vi.advanceTimersByTimeAsync(4000)
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ level: 'healthy' }))

    monitor.dispose()
  })

  it('بيسترجع الحالة الطبيعية تلقائياً بعد عودة الخدمة', async () => {
    // فشل كامل في الدورة الأولى (المحاولتين) — مش Once عشان retry المحاولة التانية تفشل برضه.
    mockCheckHealth.mockRejectedValue(new Error('down'))
    const onChange = vi.fn()
    const monitor = createRuntimeHealthMonitor(onChange, { intervalMs: 15000, criticalIntervalMs: 4000 })

    await vi.advanceTimersByTimeAsync(12000)
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ level: 'critical' }))

    // عودة الخدمة → الفحص السريع بيكتشفها ويرجّع الحالة الطبيعية.
    mockCheckHealth.mockResolvedValue(healthyReport)
    await vi.advanceTimersByTimeAsync(4000)
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ level: 'healthy', error: null }))

    monitor.dispose()
  })

  it('checkNow بيفحص فوراً بدون انتظار الفاصل', async () => {
    mockCheckHealth.mockResolvedValue(healthyReport)
    const onChange = vi.fn()
    const monitor = createRuntimeHealthMonitor(onChange, { intervalMs: 15000, criticalIntervalMs: 4000 })

    await vi.advanceTimersByTimeAsync(1000)
    const callsAfterBoot = onChange.mock.calls.length

    mockCheckHealth.mockRejectedValue(new Error('Backend stopped'))
    monitor.checkNow()
    await vi.advanceTimersByTimeAsync(12000)
    expect(onChange.mock.calls.length).toBeGreaterThan(callsAfterBoot)
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ level: 'critical' }))

    monitor.dispose()
  })

  it('dispose بيوقف المراقبة نهائياً', async () => {
    mockCheckHealth.mockResolvedValue(healthyReport)
    const onChange = vi.fn()
    const monitor = createRuntimeHealthMonitor(onChange, { intervalMs: 1000, criticalIntervalMs: 1000 })

    await vi.advanceTimersByTimeAsync(1000)
    monitor.dispose()
    const callsAtDispose = onChange.mock.calls.length

    await vi.advanceTimersByTimeAsync(10000)
    expect(onChange.mock.calls.length).toBe(callsAtDispose)
  })
})
