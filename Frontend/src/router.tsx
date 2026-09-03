/**
 * @file        : Frontend/src/router.tsx
 * @description : تعريف مسارات الواجهة باستخدام TanStack Router وربطها بحالة التطبيق.
 * @updated     : [{ "date": "03/09/2026", "version": "2.0.0", "by": ["v0"], "comment": "لغة إلزامية في الـ URL + بوابة splash عند الفتح/التحديث + تحويل المسارات القديمة" }]
 */

import { React, AppBackground, RouterProvider, applySettingsToDocument, createRootRoute, createRoute, createRouter, i18next, redirect, useAuthStore, useRouter, useRouterState, useSettingsStore, features } from '@a'
import type { AppLanguage } from '@a'
import { ErrorScreen, HealthBlocker, HomeScreen } from '@screens/system.screens'
import { SigninScreen, SignupScreen } from '@screens/auth.screens'
import { SplashScreen } from '@screens/splash.screen'
import { useBootstrap } from '@features/auth/hooks/use-bootstrap'
import { useLogout } from '@features/auth/hooks/use-logout'
import { createRuntimeHealthMonitor, type RuntimeHealthMonitorHandle, type RuntimeHealthState } from '@features/health/runtime-health-monitor'

const SUPPORTED_LANGUAGES = ['en', 'ar'] as const

/**
 * بوابة الافتتاحية: بتتفتح مرة واحدة بعد اكتمال الإقلاع، وأي تحديث كامل للصفحة
 * (F5 أو فتح رابط مباشر) بيقفلها تاني — فالمرور بالـ splash يبقى إلزامياً عند الفتح فقط.
 */
let splashGatePassed = false

/** بيستخرج اسم الشاشة من المسار سواء فيه بادئة لغة أو لا. */
// eslint-disable-next-line react-refresh/only-export-components -- الدالة pure ومطلوبة لاختبار تحليل المسارات.
export function parseScreenFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return 'home'
  const [first, second] = segments
  const screen = SUPPORTED_LANGUAGES.includes(first as (typeof SUPPORTED_LANGUAGES)[number]) ? second : first
  return screen ?? 'home'
}

/** بيحدد المسار النهائي حسب الشاشة المطلوبة والصلاحيات، مع بادئة اللغة الإلزامية. */
// eslint-disable-next-line react-refresh/only-export-components -- الدالة pure ومطلوبة لاختبار قرار التنقل.
export function resolveScreenPath(screen: string, hasUser: boolean, lang: AppLanguage = 'en'): string {
  const base = `/${lang}`
  if (screen === 'home' && !hasUser) return `${base}/signin`
  // المستخدم المسجّل ممنوع يرجع لشاشات الدخول — بيتحوّل للرئيسية.
  if ((screen === 'signin' || screen === 'signup') && hasUser) return `${base}/home`
  if (screen === 'signup') return `${base}/signup`
  if (screen === 'error') return `${base}/error`
  if (screen === 'home') return `${base}/home`
  return `${base}/signin`
}

function AppShell() {
  const { bootstrapStatus, retry } = useBootstrap()
  const user = useAuthStore((state) => state.user)
  const [runtimeHealth, setRuntimeHealth] = React.useState<RuntimeHealthState>({ level: 'healthy', report: null, error: null })
  const healthMonitorRef = React.useRef<RuntimeHealthMonitorHandle | null>(null)
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const router = useRouter()
  const theme = useSettingsStore((state) => state.theme)
  const language = useSettingsStore((state) => state.language)
  const setLanguage = useSettingsStore((state) => state.setLanguage)
  const showFocusRing = useSettingsStore((state) => state.showFocusRing)
  const [gatePassed, setGatePassed] = React.useState(splashGatePassed)

  React.useEffect(() => {
    applySettingsToDocument(theme, language, showFocusRing)
  }, [theme, language, showFocusRing])

  // الـ URL هو المرجع الأعلى للغة: أي مسار ببادئة لغة صحيحة بيحدد لغة التطبيق فوراً.
  React.useEffect(() => {
    const match = pathname.match(/^\/(en|ar)(?=\/|$)/)
    if (match && match[1] !== language) {
      setLanguage(match[1] as AppLanguage)
      void i18next.changeLanguage(match[1])
    }
  }, [pathname, language, setLanguage])

  // فتح بوابة الافتتاحية بعد اكتمال الإقلاع (أو فشله).
  React.useEffect(() => {
    if (gatePassed) return
    if (bootstrapStatus === 'ready' || bootstrapStatus === 'degraded' || bootstrapStatus === 'error') {
      splashGatePassed = true
      setGatePassed(true)
    }
  }, [bootstrapStatus, gatePassed])

  // التوجيه حسب الصلاحيات: بعد الإقلاع وعند أي تغيير في الجلسة (دخول/خروج/خطأ).
  React.useEffect(() => {
    const lang = useSettingsStore.getState().language
    if (bootstrapStatus === 'error') {
      void router.navigate({ to: '/$lang/error', params: { lang }, replace: true })
      return
    }
    if (bootstrapStatus !== 'ready' && bootstrapStatus !== 'degraded') return
    void router.navigate({ to: user ? '/$lang/home' : '/$lang/signin', params: { lang }, replace: true })
  }, [bootstrapStatus, router, user])

  // مراقبة صحّة مستمرة بعد الإقلاع: انقطاع → حجب فوري، عودة → استرجاع تلقائي لنفس الشاشة.
  React.useEffect(() => {
    if (bootstrapStatus !== 'ready' && bootstrapStatus !== 'degraded') return
    const monitor = createRuntimeHealthMonitor(setRuntimeHealth)
    healthMonitorRef.current = monitor
    return monitor.dispose
  }, [bootstrapStatus])

  const navigate = (screen: string) => {
    void router.navigate({ to: resolveScreenPath(screen, Boolean(user), language) })
  }
  // تسجيل الخروج الحقيقي: إبطال الجلسة على السيرفر أولاً، ثم مسح الحالة والانتقال لصفحة الدخول.
  const { logout } = useLogout(() => { void router.navigate({ to: '/$lang/signin', params: { lang: useSettingsStore.getState().language }, replace: true }) })

  const retryFromError = () => {
    // إعادة قفل بوابة الافتتاحية عشان المحاولة الجديدة تمر بالـ splash من جديد.
    splashGatePassed = false
    setGatePassed(false)
    retry()
  }

  const screen = parseScreenFromPath(pathname)
  // حجب الانقطاع بيغطي كل الشاشات (دخول/تسجيل/رئيسية) — وبيرفع نفسه تلقائياً لما الخدمة ترجع.
  const healthBlocker = runtimeHealth.level === 'critical'
    ? <HealthBlocker detail={runtimeHealth.error?.message} onRetry={() => healthMonitorRef.current?.checkNow()} />
    : null
  let content: React.ReactNode
  if (bootstrapStatus === 'error') content = <ErrorScreen onRetry={retryFromError} />
  else if (!gatePassed) content = <SplashScreen status={bootstrapStatus} />
  else if (screen === 'error') content = <ErrorScreen onRetry={retryFromError} />
  else if (screen === 'home') content = user ? <><HomeScreen onLogout={() => { void logout() }} />{healthBlocker}</> : <><SigninScreen onNavigate={navigate} />{healthBlocker}</>
  else if (screen === 'signup') content = <>{features.ENABLE_SIGNUP ? <SignupScreen onNavigate={navigate} /> : <SigninScreen onNavigate={navigate} />}{healthBlocker}</>
  else if (screen === 'signin') content = <><SigninScreen onNavigate={navigate} />{healthBlocker}</>
  else content = <SplashScreen status={bootstrapStatus} />

  return <><AppBackground /><div className="relative z-10 app-content-layer">{content}</div></>
}

const rootRoute = createRootRoute({ component: AppShell })

// المسارات الكاملة: بادئة لغة إلزامية، وأي لغة غير مدعومة بتتحوّل للأقرب (ar → عربي، غير كده → إنجليزي).
const langRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$lang',
  beforeLoad: ({ params }) => {
    if (params.lang !== 'en' && params.lang !== 'ar') {
      throw redirect({ to: '/$lang/home', params: { lang: params.lang.toLowerCase().startsWith('ar') ? 'ar' : 'en' } })
    }
  },
})
const langSigninRoute = createRoute({ getParentRoute: () => langRoute, path: '/signin' })
const langSignupRoute = createRoute({ getParentRoute: () => langRoute, path: '/signup' })
const langHomeRoute = createRoute({ getParentRoute: () => langRoute, path: '/home' })
const langErrorRoute = createRoute({ getParentRoute: () => langRoute, path: '/error' })

// المسارات القديمة بدون لغة: تحويل تلقائي للمسار المكافئ بلغة التطبيق الحالية.
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', beforeLoad: () => { throw redirect({ to: '/$lang/home', params: { lang: useSettingsStore.getState().language } }) } })
const signinRoute = createRoute({ getParentRoute: () => rootRoute, path: '/signin', beforeLoad: () => { throw redirect({ to: '/$lang/signin', params: { lang: useSettingsStore.getState().language } }) } })
const signupRoute = createRoute({ getParentRoute: () => rootRoute, path: '/signup', beforeLoad: () => { throw redirect({ to: '/$lang/signup', params: { lang: useSettingsStore.getState().language } }) } })
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/home', beforeLoad: () => { throw redirect({ to: '/$lang/home', params: { lang: useSettingsStore.getState().language } }) } })
const errorRoute = createRoute({ getParentRoute: () => rootRoute, path: '/error', beforeLoad: () => { throw redirect({ to: '/$lang/error', params: { lang: useSettingsStore.getState().language } }) } })

// eslint-disable-next-line react-refresh/only-export-components -- قائمة المسارات مصدر اختبار مركزي.
export const ROUTE_PATHS = ['/en/signin', '/en/signup', '/en/home', '/en/error', '/ar/signin', '/ar/signup', '/ar/home', '/ar/error'] as const
// eslint-disable-next-line react-refresh/only-export-components -- شجرة المسارات مطلوبة لإنشاء Router مركزي.
export const routeTree = rootRoute.addChildren([
  indexRoute,
  signinRoute,
  signupRoute,
  homeRoute,
  errorRoute,
  langRoute.addChildren([langSigninRoute, langSignupRoute, langHomeRoute, langErrorRoute]),
])
// eslint-disable-next-line react-refresh/only-export-components -- التصدير مطلوب لتهيئة Router المركزي.
export const router = createRouter({ routeTree })
export function AppRouter() { return <RouterProvider router={router} /> }
export default AppRouter
