/**
 * @file        : Frontend/src/features/auth/lib/permissions.test.ts
 * @description : اختبارات طبقة الصلاحيات can/canAny.
 */
import { describe, expect, it } from 'vitest'
import { can, canAny } from './permissions'

const admin = { permissions: ['users:read', 'users:write', 'users:delete', 'roles:manage', 'storage:read', 'storage:write'] }
const viewer = { permissions: ['users:read', 'storage:read'] }
const wildcard = { permissions: ['storage:*'] }
const nobody = { permissions: [] }

describe('can', () => {
  it('يطابق المفتاح مباشرة', () => {
    expect(can(admin, 'users:write')).toBe(true)
    expect(can(viewer, 'users:write')).toBe(false)
  })

  it('يرفض المستخدم بدون جلسة أو بدون صلاحيات', () => {
    expect(can(null, 'users:read')).toBe(false)
    expect(can(nobody, 'users:read')).toBe(false)
  })

  it('يدعم wildcard على مستوى المورد', () => {
    expect(can(wildcard, 'storage:write')).toBe(true)
    expect(can(wildcard, 'users:read')).toBe(false)
  })
})

describe('canAny', () => {
  it('يرجع true لو أي صلاحية متحققة', () => {
    expect(canAny(viewer, ['users:write', 'users:read'])).toBe(true)
    expect(canAny(viewer, ['users:write', 'users:delete'])).toBe(false)
  })
})
