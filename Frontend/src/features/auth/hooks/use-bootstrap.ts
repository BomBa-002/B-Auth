/**
 * @file        : Frontend/src/features/auth/hooks/use-bootstrap.ts
 * @description : Hook لإدارة دورة الإقلاع، الاستعادة، وإعادة المحاولة الآمنة.
 * @updated     : [{ "date": "27/08/2026", "version": "2.0.0", "by": ["v0"], "comment": "فصل orchestration وإضافة minimum splash" }]
 */

import { React, useAuthStore } from '@a'
import { features } from '@a'
import { runBootstrap } from '@features/bootstrap/bootstrap.orchestrator'

export type BootstrapErrorReason = 'health' | 'unexpected' | null
const MIN_SPLASH_MS = Math.min(10000, Math.max(3000, features.SPLASH_MIN_DURATION_MS))
let startupPromise: Promise<void> | null = null

/** بيشغّل الإقلاع مرة واحدة، ويضمن زمن ظهور أدنى بدون تأخير الطلبات. */
export function useBootstrap() {
  const bootstrapStatus = useAuthStore((state) => state.bootstrapStatus)
  const setBootstrapStatus = useAuthStore((state) => state.setBootstrapStatus)
  const setSession = useAuthStore((state) => state.setSession)
  const [errorReason, setErrorReason] = React.useState<BootstrapErrorReason>(null)
  const abortRef = React.useRef<AbortController | null>(null)

  const run = React.useCallback(async (): Promise<void> => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const start = Date.now()
    setErrorReason(null)
    setBootstrapStatus('running')
    try {
      const result = await runBootstrap(controller.signal)
      if (controller.signal.aborted) return
      if (result.accessToken && result.user) setSession({ accessToken: result.accessToken, user: result.user, persistent: result.persistent })
      const nextStatus = result.health.status === 'degraded' ? 'degraded' : 'ready'
      const elapsed = Date.now() - start
      if (features.ENABLE_SPLASH_MIN_DURATION && elapsed < MIN_SPLASH_MS && !controller.signal.aborted) await new Promise((resolve) => window.setTimeout(resolve, MIN_SPLASH_MS - elapsed))
      if (controller.signal.aborted) return
      setBootstrapStatus(nextStatus)
    } catch (error) {
      if (controller.signal.aborted) return
      setErrorReason(error instanceof Error && 'kind' in error && (error as { kind?: string }).kind === 'auth' ? 'unexpected' : 'health')
      setBootstrapStatus('error')
    }
  }, [setBootstrapStatus, setSession])

  React.useEffect(() => {
    if (!startupPromise) startupPromise = run()
    return () => undefined
  }, [run])

  const retry = React.useCallback(() => {
    startupPromise = null
    setBootstrapStatus('retrying')
    startupPromise = run()
  }, [run, setBootstrapStatus])

  return { bootstrapStatus, errorReason, retry }
}
