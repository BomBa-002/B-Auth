/**
 * @file        : Frontend/src/screens/splash.screen.test.ts
 * @description : اختبار نسب التقدم المرتبطة بحالات الإقلاع.
 * @updated     : [{ "date": "01/09/2026", "version": "1.0.0", "by": ["v0"], "comment": "إضافة اختبارات حالات الإقلاع" }]
 */

import { describe, expect, it } from 'vitest'
import { getSplashProgress } from './splash-progress'

describe('getSplashProgress', () => {
  it('returns full progress only after bootstrap is complete', () => {
    expect(getSplashProgress('ready')).toBe(100)
    expect(getSplashProgress('degraded')).toBe(100)
  })

  it('keeps active and failed states visually distinct', () => {
    expect(getSplashProgress('running')).toBe(68)
    expect(getSplashProgress('retrying')).toBe(68)
    expect(getSplashProgress('error')).toBe(0)
  })
})
