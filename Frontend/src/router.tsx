/**
 * @file        : Frontend/src/router.tsx
 * @description : تعريف مسارات الواجهة باستخدام TanStack Router وربطها بحالة التطبيق.
 * @updated     : [{ "date": "01/09/2026", "version": "1.0.0", "by": ["v0"], "comment": "إضافة التوجيه المركزي للمسارات" }]
 */

import { React, AppBackground, RouterProvider, applySettingsToDocument, createRootRoute, createRoute, createRouter, features, useAuthStore, useRouter, useRouterState, useSettingsStore } from '@a'
import { ErrorScreen, HealthBlocker, HomeScreen } from '@screens/system.screens'
import { SigninScreen, SignupScreen } from '@screens/auth.screens'
import { SplashScreen } from '@screens/splash.screen'
import { useBootstrap } from '@features/auth/hooks/use-bootstrap'
import { createRuntimeHealthMonitor, type RuntimeHealthState } from '@features/health/runtime-health-monitor'

function AppShell() {
  const { bootstrapStatus, retry } = useBootstrap()
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const [runtimeHealth, setRuntimeHealth] = React.useState<RuntimeHealthState>({ level: 'healthy', report: null, error: null })
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const router = useRouter()
  const theme = useSettingsStore((state) => state.theme)
  const language = useSettingsStore((state) => state.language)
  const showFocusRing = useSettingsStore((state) => state.showFocusRing)

  React.useEffect(() => {
    applySettingsToDocument(theme, language, showFocusRing)
  }, [theme, language, showFocusRing])

  React.useEffect(() => {
    if (bootstrapStatus === 'error') {
      void router.navigate({ to: '/error', replace: true })
      return
    }
    if (bootstrapStatus !== 'ready' && bootstrapStatus !== 'degraded') return
    void router.navigate({ to: user ? '/home' : '/signin', replace: true })
  }, [bootstrapStatus, router, user])

  React.useEffect(() => {
    if (bootstrapStatus !== 'ready' && bootstrapStatus !== 'degraded') return
    return createRuntimeHealthMonitor(setRuntimeHealth)
  }, [bootstrapStatus])

  const navigate = (screen: string) => {
    const target = screen === 'home' && !user ? '/signin' : `/${screen}`
    void router.navigate({ to: target as '/signin' | '/signup' | '/home' | '/error' })
  }

  let content: React.ReactNode
  if (pathname === '/error') content = <ErrorScreen onRetry={() => { void router.navigate({ to: '/', replace: true }); retry() }} />
  else if (pathname === '/home') content = user ? <><HomeScreen onLogout={() => { clearSession(); navigate('signin') }} />{runtimeHealth.level === 'critical' ? <HealthBlocker onRetry={() => window.location.reload()} /> : null}</> : <SigninScreen onNavigate={navigate} />
  else if (pathname === '/signup' && features.ENABLE_SIGNUP) content = <SignupScreen onNavigate={navigate} />
  else if (pathname === '/signin') content = <SigninScreen onNavigate={navigate} />
  else content = <SplashScreen status={bootstrapStatus} />

  return <><AppBackground /><div className="relative z-10 app-content-layer">{content}</div></>
}

const rootRoute = createRootRoute({ component: AppShell })
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/' })
const signinRoute = createRoute({ getParentRoute: () => rootRoute, path: '/signin' })
const signupRoute = createRoute({ getParentRoute: () => rootRoute, path: '/signup' })
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/home' })
const errorRoute = createRoute({ getParentRoute: () => rootRoute, path: '/error' })
// eslint-disable-next-line react-refresh/only-export-components -- قائمة المسارات مصدر اختبار مركزي.
export const ROUTE_PATHS = ['/', '/signin', '/signup', '/home', '/error'] as const
// eslint-disable-next-line react-refresh/only-export-components -- شجرة المسارات مطلوبة لإنشاء Router مركزي.
export const routeTree = rootRoute.addChildren([indexRoute, signinRoute, signupRoute, homeRoute, errorRoute])
// eslint-disable-next-line react-refresh/only-export-components -- التصدير مطلوب لتهيئة Router المركزي.
export const router = createRouter({ routeTree })
export function AppRouter() { return <RouterProvider router={router} /> }
export default AppRouter
