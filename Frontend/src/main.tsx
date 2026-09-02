/**
 * @file        : Frontend/src/main.tsx
 * @description : نقطة تشغيل B-Auth مع lifecycle الإقلاع ومراقبة الصحة.
 * @updated     : [{ "date": "27/08/2026", "version": "2.0.0", "by": ["v0"], "comment": "ربط حالات ready/degraded/blocked ومراقبة runtime" }]
 */

import { applySettingsToDocument, configureHttp, createRoot, useAuthStore, useSettingsStore } from '@a'
import { AppRouter } from './router'
import '@styles/globals.css'

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
