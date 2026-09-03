/**
 * @file        : Frontend/src/features/health/runtime-health-provider.tsx
 * @description : طبقة middleware للمراقبة — بتتركّب مرة واحدة في جذر التطبيق فبتشغل المراقب
 *                على كل الشاشات (حتى شاشة الخطأ) من لحظة الإقلاع، وبتحدّث المخزن المركزي.
 * @updated     : [{ "date": "03/09/2026", "version": "1.0.0", "by": ["v0"], "comment": "نقل المراقبة من الـ router لطبقة عامة تشتغل في كل مكان" }]
 */

import { React } from '@a'
import { createRuntimeHealthMonitor } from '@features/health/runtime-health-monitor'
import { useHealthStore } from '@features/health/health.store'

/**
 * طبقة غير مرئية: بتشتغل مع أول رسم للتطبيق وبتفضل شغالة مهما كانت الشاشة
 * (splash / signin / signup / home / error) — الحالة بتتحدّث في الـ store
 * وأي مكوّن مشترك بيتحدث تلقائياً.
 */
export function RuntimeHealthProvider() {
  const setHealth = useHealthStore((state) => state.setHealth)
  const registerMonitor = useHealthStore((state) => state.registerMonitor)

  React.useEffect(() => {
    const monitor = createRuntimeHealthMonitor(setHealth)
    registerMonitor(monitor)
    return () => {
      registerMonitor(null)
      monitor.dispose()
    }
  }, [setHealth, registerMonitor])

  return null
}
