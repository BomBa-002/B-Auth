/**
 * Thin wrapper around `window.localStorage` that never throws (private-mode
 * browsers, SSR, storage quota errors) and JSON-encodes/decodes values.
 *
 * IMPORTANT: this is a generic persistence helper only. It must never be used
 * to persist access tokens, refresh tokens, or passwords — those stay in
 * memory only (see Frontend `features/auth/store/auth.store.ts`).
 */
export const safeStorage = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback
    try {
      const raw = window.localStorage.getItem(key)
      if (raw === null) return fallback
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  },
  set(key: string, value: unknown): void {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore quota/private-mode errors
    }
  },
  remove(key: string): void {
    if (typeof window === "undefined") return
    try {
      window.localStorage.removeItem(key)
    } catch {
      // ignore
    }
  },
}
