/**
 * @file        : Frontend/src/features/bootstrap/bootstrap.orchestrator.ts
 * @description : تنسيق health واستعادة الجلسة بدون أي اعتماد على JSX.
 * @updated     : [{ "date": "27/08/2026", "version": "1.0.0", "by": ["v0"], "comment": "إضافة دورة إقلاع قابلة للإلغاء" }]
 */

import { checkHealth } from '@services/health.service'
import { refresh } from '@services/auth.service'
import { withRetry, type RetryMetadata } from './retry-policy'
import type { AuthUser } from '@features/auth/store/auth.store'

export interface BootstrapResult {
  user: AuthUser | null
  accessToken: string | null
  persistent: boolean
  health: Awaited<ReturnType<typeof checkHealth>>
  metadata: RetryMetadata
}

/** بيتأكد من البنية التحتية وبعدين بيحاول يستعيد الجلسة بأمان. */
export async function runBootstrap(signal?: AbortSignal): Promise<BootstrapResult> {
  const healthResult = await withRetry(() => checkHealth(), { signal, attempts: 3, timeoutMs: 6000 })
  let session: Awaited<ReturnType<typeof refresh>> = null
  try {
    session = await refresh()
  } catch {
    session = null
  }
  return {
    user: session?.user ?? null,
    accessToken: session?.accessToken ?? null,
    persistent: session?.persistent ?? false,
    health: healthResult.value,
    metadata: healthResult.metadata,
  }
}
