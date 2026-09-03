/**
 * @file        : Frontend/src/features/health/health.store.ts
 * @description : مخزن مركزي لحالة صحّة النظام — أي مكوّن (شاشة/شريط حالة/حجب) بيقرأ منه الحالة الحية.
 * @updated     : [{ "date": "03/09/2026", "version": "1.0.0", "by": ["v0"], "comment": "طبقة middleware للمراقبة: store موحّد + تحكم في تشغيل المراقب" }]
 */

import { create } from 'zustand'
import type { RuntimeHealthState } from '@features/health/runtime-health-monitor'
import type { RuntimeHealthMonitorHandle } from '@features/health/runtime-health-monitor'

interface HealthStoreState {
  /** آخر حالة مرصودة للـ Backend (مستوى + تقرير + خطأ). */
  health: RuntimeHealthState
  /** مرجع المراقب الشغّال حالياً — لإصدار فحص فوري من أي مكان. */
  monitor: RuntimeHealthMonitorHandle | null
  setHealth: (health: RuntimeHealthState) => void
  registerMonitor: (monitor: RuntimeHealthMonitorHandle | null) => void
}

export const useHealthStore = create<HealthStoreState>((set) => ({
  health: { level: 'healthy', report: null, error: null },
  monitor: null,
  setHealth: (health) => set({ health }),
  registerMonitor: (monitor) => set({ monitor }),
}))

/** فحص فوري من أي مكان في التطبيق (زر إعادة المحاولة مثلاً). */
export function checkHealthNow(): void {
  useHealthStore.getState().monitor?.checkNow()
}
