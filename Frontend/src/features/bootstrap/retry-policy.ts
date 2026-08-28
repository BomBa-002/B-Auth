/**
 * @file        : Frontend/src/features/bootstrap/retry-policy.ts
 * @description : سياسة موحّدة للمهل وإعادة المحاولة أثناء الإقلاع والمراقبة.
 * @updated     : [{ "date": "27/08/2026", "version": "1.0.0", "by": ["v0"], "comment": "إضافة سياسة retry قابلة للإلغاء" }]
 */

export type RetryFailureKind = 'network' | 'timeout' | 'server' | 'auth' | 'client'

export interface RetryPolicyOptions {
  attempts?: number
  timeoutMs?: number
  baseDelayMs?: number
  signal?: AbortSignal
}

export interface RetryMetadata {
  attempts: number
  startedAt: number
  completedAt: number
}

export class RetryPolicyError extends Error {
  readonly kind: RetryFailureKind
  readonly attempts: number

  constructor(message: string, kind: RetryFailureKind, attempts: number) {
    super(message)
    this.name = 'RetryPolicyError'
    this.kind = kind
    this.attempts = attempts
  }
}

function classifyError(error: unknown): RetryFailureKind {
  const status = typeof error === 'object' && error !== null && 'response' in error
    ? (error as { response?: { status?: number } }).response?.status
    : undefined
  if (status === 401 || status === 403) return 'auth'
  if (typeof status === 'number' && status >= 500) return 'server'
  if (error instanceof DOMException && error.name === 'AbortError') return 'timeout'
  return 'network'
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Operation cancelled', 'AbortError'))
    const timer = window.setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('Operation cancelled', 'AbortError')) }, { once: true })
  })
}

/** بينفّذ عملية بمهلة زمنية وbackoff عشوائي، وبيمنع إعادة محاولة أخطاء auth. */
export async function withRetry<T>(operation: (signal: AbortSignal) => Promise<T>, options: RetryPolicyOptions = {}): Promise<{ value: T; metadata: RetryMetadata }> {
  const attemptsLimit = Math.max(1, Math.min(options.attempts ?? 3, 3))
  const timeoutMs = options.timeoutMs ?? 6000
  const baseDelayMs = options.baseDelayMs ?? 500
  const startedAt = Date.now()
  let lastError: unknown

  for (let attempt = 1; attempt <= attemptsLimit; attempt += 1) {
    const controller = new AbortController()
    const onAbort = () => controller.abort()
    options.signal?.addEventListener('abort', onAbort, { once: true })
    const timer = window.setTimeout(() => controller.abort(), timeoutMs)
    try {
      const value = await operation(controller.signal)
      return { value, metadata: { attempts: attempt, startedAt, completedAt: Date.now() } }
    } catch (error) {
      lastError = error
      const kind = classifyError(error)
      if (kind === 'auth' || attempt === attemptsLimit || options.signal?.aborted) throw new RetryPolicyError(error instanceof Error ? error.message : 'Operation failed', kind, attempt)
      await wait(baseDelayMs * 2 ** (attempt - 1) + Math.floor(Math.random() * 250), options.signal)
    } finally {
      window.clearTimeout(timer)
      options.signal?.removeEventListener('abort', onAbort)
    }
  }
  throw lastError
}

export default withRetry
