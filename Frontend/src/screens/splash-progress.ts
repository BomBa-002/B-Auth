/**
 * @file        : Frontend/src/screens/splash-progress.ts
 * @description : دوال حساب نسبة التقدم في شاشة الإقلاع.
 * @updated     : [{ "date": "01/09/2026", "version": "1.0.0", "by": ["v0"], "comment": "فصل منطق التقدم عن مكون الشاشة" }]
 */

import type { BootstrapStatus } from '@features/auth/store/auth.store'

export function getSplashProgress(status: BootstrapStatus): number {
  if (status === 'ready' || status === 'degraded') return 100
  if (status === 'running' || status === 'retrying') return 68
  if (status === 'error') return 0
  return 46
}
