/**
 * @file        : Frontend/src/main.tsx
 * @description : نقطة تشغيل B-Auth مع lifecycle الإقلاع ومراقبة الصحة.
 * @updated     : [{ "date": "02/09/2026", "version": "2.0.1", "by": ["v0"], "comment": "إعادة تشغيل بيئة المعاينة بعد تحرير المنافذ" }]
 */

import { applySettingsToDocument, configureHttp, createRoot, useAuthStore, useSettingsStore } from '@a'
import { AppRouter } from './router'
import '@styles/globals.css'

// Sentry اختياري — بيتفعّل بس لما VITE_SENTRY_DSN يكون موجود (dynamic import عشان ما يتحمّلش في العادي).
const sentryDsn = import.meta.env.VITE_SENTRY_DSN as string | undefined
if (sentryDsn) {
  void import('@sentry/react').then((Sentry) => {
    Sentry.init({ dsn: sentryDsn, environment: import.meta.env.MODE })
  })
}

configureHttp({ getAccessToken: () => useAuthStore.getState().accessToken, clearSession: () => useAuthStore.getState().clearSession(), setAccessToken: (token) => useAuthStore.getState().setAccessToken(token) })
applySettingsToDocument(useSettingsStore.getState().theme, useSettingsStore.getState().language, useSettingsStore.getState().showFocusRing)

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element was not found')
const rootKey = '__bAuthReactRoot__'
type RootRegistry = typeof globalThis & { [rootKey]?: ReturnType<typeof createRoot> }
const rootRegistry = globalThis as RootRegistry
const root = rootRegistry[rootKey] ?? createRoot(rootElement)
rootRegistry[rootKey] = root
root.render(<AppRouter />)
export default AppRouter
