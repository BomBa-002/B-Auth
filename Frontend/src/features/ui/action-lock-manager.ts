/**
 * @file        : Frontend/src/features/ui/action-lock-manager.ts
 * @description : مدير أقفال متزامن لمنع تنفيذ نفس الفعل أكتر من مرة.
 * @updated     : [{ "date": "01/09/2026", "version": "1.0.0", "by": ["v0"], "comment": "إنشاء مدير الأقفال" }]
 */

export type ActionLockKey = string | readonly string[]

export interface ActionLockRequest {
  lockKey?: ActionLockKey
  lockGroup?: ActionLockKey
}

interface ActiveLock {
  owner: symbol
  keys: Set<string>
}

const activeLocks = new Map<string, ActiveLock>()

function normalizeKeys(value?: ActionLockKey): string[] {
  if (!value) return []
  return (Array.isArray(value) ? value : [value]).filter(Boolean)
}

function hasConflict(keys: string[]): boolean {
  return keys.some((key) => activeLocks.has(key))
}

export const ActionLockManager = {
  tryAcquire(request: ActionLockRequest): symbol | null {
    const keys = [...new Set([...normalizeKeys(request.lockKey), ...normalizeKeys(request.lockGroup)])]
    if (keys.length === 0 || hasConflict(keys)) return null
    const owner = Symbol('action-lock-owner')
    const lock: ActiveLock = { owner, keys: new Set(keys) }
    keys.forEach((key) => activeLocks.set(key, lock))
    return owner
  },

  release(owner: symbol | null): void {
    if (!owner) return
    const locks = new Set([...activeLocks.values()].filter((lock) => lock.owner === owner))
    locks.forEach((lock) => lock.keys.forEach((key) => activeLocks.delete(key)))
  },

  clear(): void {
    activeLocks.clear()
  },
}
