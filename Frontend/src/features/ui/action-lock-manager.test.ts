/**
 * @file        : Frontend/src/features/ui/action-lock-manager.test.ts
 * @description : اختبارات ملكية الأقفال ومنع التكرار والتعارض بين الأفعال.
 * @updated     : [{ "date": "02/09/2026", "version": "1.0.0", "by": ["v0"], "comment": "إضافة اختبارات مدير الأقفال" }]
 */

import { afterEach, describe, expect, it } from 'vitest'
import { ActionLockManager } from './action-lock-manager'

describe('ActionLockManager', () => {
  afterEach(() => ActionLockManager.clear())

  it('rejects a second owner for the same key', () => {
    const firstOwner = ActionLockManager.tryAcquire({ lockKey: 'auth:login' })

    expect(firstOwner).not.toBeNull()
    expect(ActionLockManager.tryAcquire({ lockKey: 'auth:login' })).toBeNull()
  })

  it('rejects intersecting lock groups while allowing independent actions', () => {
    const owner = ActionLockManager.tryAcquire({ lockGroup: ['auth', 'network'] })

    expect(owner).not.toBeNull()
    expect(ActionLockManager.tryAcquire({ lockGroup: 'auth' })).toBeNull()
    expect(ActionLockManager.tryAcquire({ lockKey: 'settings:theme' })).not.toBeNull()
  })

  it('only releases locks owned by the matching token', () => {
    const owner = ActionLockManager.tryAcquire({ lockKey: 'bootstrap:retry' })
    const otherOwner = Symbol('other-owner')

    ActionLockManager.release(otherOwner)
    expect(ActionLockManager.tryAcquire({ lockKey: 'bootstrap:retry' })).toBeNull()

    ActionLockManager.release(owner)
    expect(ActionLockManager.tryAcquire({ lockKey: 'bootstrap:retry' })).not.toBeNull()
  })
})
