/**
 * @file        : Frontend/src/features/auth/hooks/use-logout.ts
 * @description : Hook لتسجيل الخروج الحقيقي — يلغي الجلسة على السيرفر (ويمسح الـ refresh cookie) ثم يمسح الحالة المحلية.
 * @updated     : [{ "date": "02/09/2026", "version": "1.0.0", "by": ["v0"], "comment": "إضافة Logout يستدعي POST /api/auth/logout بدل المسح المحلي فقط" }]
 */

import { React, useAuthStore } from '@a'
import { logout as logoutRequest } from '@services/auth.service'

/**
 * بيرجّع دالة logout آمنة:
 * - بتطلب من السيرفر إبطال الجلسة (revoke) ومسح الـ HttpOnly cookie.
 * - لو الطلب فشل (شبكة/سيرفر واقع) بنكمّل ونمسح الحالة المحلية على أي حال —
 *   المستخدم لازم يخرج من الواجهة حتى لو السيرفر مش متاح.
 * - المسح المحلي بيحصل بعد الطلب، لأن الـ interceptor محتاج الـ access token
 *   لإرسال Authorization header مع طلب الخروج.
 */
export function useLogout(onDone?: () => void) {
  const clearSession = useAuthStore((state) => state.clearSession)
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const logout = React.useCallback(async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await logoutRequest()
    } catch {
      // فشل إبطال الجلسة على السيرفر مش سبب لحجز المستخدم في الواجهة.
    } finally {
      clearSession()
      setIsLoggingOut(false)
      onDone?.()
    }
  }, [clearSession, isLoggingOut, onDone])

  return { logout, isLoggingOut }
}
