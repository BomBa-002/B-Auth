/**
 * @file        : Frontend/src/main.tsx
 * @description : نقطة تشغيل B-Auth مع lifecycle الإقلاع ومراقبة الصحة.
 * @updated     : [{ "date": "27/08/2026", "version": "2.0.0", "by": ["v0"], "comment": "ربط حالات ready/degraded/blocked ومراقبة runtime" }]
 */

import { React, applySettingsToDocument, configureHttp, createRoot, useAuthStore, useSettingsStore, features } from '@a'
import { useBootstrap } from '@features/auth/hooks/use-bootstrap'
import { createRuntimeHealthMonitor, type RuntimeHealthState } from '@features/health/runtime-health-monitor'
import { SplashScreen } from '@screens/splash.screen'
import { SigninScreen, SignupScreen } from '@screens/auth.screens'
import { ErrorScreen, HomeScreen, HealthBlocker } from '@screens/system.screens'
import { AppBackground } from '@components/app-background'
import '@styles/globals.css'

configureHttp({ getAccessToken: () => useAuthStore.getState().accessToken, clearSession: () => useAuthStore.getState().clearSession(), setAccessToken: (token) => useAuthStore.getState().setAccessToken(token) })
applySettingsToDocument(useSettingsStore.getState().theme, useSettingsStore.getState().language, useSettingsStore.getState().showFocusRing)

function App() {
  const { bootstrapStatus, retry } = useBootstrap()
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const [screen, setScreen] = React.useState('splash')
  const [runtimeHealth, setRuntimeHealth] = React.useState<RuntimeHealthState>({ level: 'healthy', report: null, error: null })
  const navigate = (nextScreen: string) => setScreen(nextScreen === 'home' && !user ? 'signin' : nextScreen)
  const theme = useSettingsStore((state) => state.theme)
  const language = useSettingsStore((state) => state.language)
  const showFocusRing = useSettingsStore((state) => state.showFocusRing)

  React.useEffect(() => {
    applySettingsToDocument(theme, language, showFocusRing)
  }, [theme, language, showFocusRing])

  React.useEffect(() => {
    if (bootstrapStatus === 'error') {
      setScreen('error')
      return undefined
    }
    if (bootstrapStatus !== 'ready' && bootstrapStatus !== 'degraded') return undefined

    const timer = window.setTimeout(() => setScreen(user ? 'home' : 'signin'), 2500)
    return () => window.clearTimeout(timer)
  }, [bootstrapStatus, user])

  React.useEffect(() => {
    if (bootstrapStatus !== 'ready' && bootstrapStatus !== 'degraded') return undefined
    return createRuntimeHealthMonitor(setRuntimeHealth)
  }, [bootstrapStatus])

  let content: React.ReactNode
  if (screen === 'error') content = <ErrorScreen onRetry={() => { setScreen('splash'); retry() }} />
  else if (screen === 'home') content = user ? <><HomeScreen onLogout={() => { clearSession(); setScreen('signin') }} />{runtimeHealth.level === 'critical' ? <HealthBlocker onRetry={() => window.location.reload()} /> : null}</> : <SigninScreen onNavigate={navigate} />
  else if (screen === 'signup' && features.ENABLE_SIGNUP) content = <SignupScreen onNavigate={navigate} />
  else if (screen === 'signin') content = <SigninScreen onNavigate={navigate} />
  else content = <SplashScreen status={bootstrapStatus} />

  return <><AppBackground /><div className="relative z-10 app-content-layer">{content}</div></>
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element was not found')
const rootKey = '__bAuthReactRoot__'
type RootRegistry = typeof globalThis & { [rootKey]?: ReturnType<typeof createRoot> }
const rootRegistry = globalThis as RootRegistry
const root = rootRegistry[rootKey] ?? createRoot(rootElement)
rootRegistry[rootKey] = root
root.render(<App />)
export default App
