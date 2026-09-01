/**
 * @file        : Frontend/src/router.test.ts
 * @description : اختبار المسارات الأساسية والتأكد من عدم حذف أي شاشة معتمدة.
 * @updated     : [{ "date": "01/09/2026", "version": "1.0.0", "by": ["v0"], "comment": "إضافة اختبار شجرة المسارات" }]
 */

import { describe, expect, it } from 'vitest'
import { ROUTE_PATHS } from './router'

describe('application route tree', () => {
  it('contains all public and protected screen paths', () => {
    expect(ROUTE_PATHS).toEqual(expect.arrayContaining(['/', '/signin', '/signup', '/home', '/error']))
  })
})
