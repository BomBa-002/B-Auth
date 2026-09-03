/**
 * @file        : Frontend/src/lib/resolve-api-error.ts
 * @description : المترجم المركزي لأكواد أخطاء الـ API — بيحوّل كود الخطأ الموحّد
 *                (زي INVALID_CREDENTIALS) لرسالة مفهومة باللغة المناسبة.
 *
 * قاعدة اختيار اللغة:
 * - وضع التطوير (import.meta.env.DEV): عربي دايماً — عشان تسريع الـ debugging.
 * - وضع النشر: لغة الواجهة الحالية (بتتبع لغة النظام والافتراضي إنجليزي).
 */

import { i18next } from '@i18n/index'

interface ErrorEnvelopeBody {
  error?: {
    code?: string
    message?: string
  }
}

/** خريطة أكواد الـ Backend الموحّدة → مفاتيح الترجمة. */
const CODE_TO_KEY: Record<string, string> = {
  INVALID_CREDENTIALS: 'auth.error_invalid_credentials',
  ACCOUNT_DISABLED: 'auth.error_account_disabled',
  INVALID_REFRESH_TOKEN: 'errors.codes.session_expired',
  SESSION_EXPIRED: 'errors.codes.session_expired',
  UNAUTHORIZED: 'errors.codes.unauthorized',
  FORBIDDEN: 'errors.codes.forbidden',
  NOT_FOUND: 'errors.codes.not_found',
  CONFLICT: 'errors.codes.conflict',
  VALIDATION_ERROR: 'errors.codes.validation',
  TOO_MANY_REQUESTS: 'errors.codes.too_many_requests',
  BAD_REQUEST: 'errors.codes.bad_request',
  INTERNAL_ERROR: 'errors.codes.internal',
}

/** بيستخرج كود الخطأ والرسالة الأصلية من رد الـ API (شكل ErrorEnvelope). */
function extractErrorEnvelope(err: unknown): { code?: string; message?: string } {
  const axiosError = err as { response?: { data?: ErrorEnvelopeBody } } | undefined
  return {
    code: axiosError?.response?.data?.error?.code,
    message: axiosError?.response?.data?.error?.message,
  }
}

/**
 * بيحدد لغة عرض الخطأ: تطوير → عربي دايماً، نشر → لغة الواجهة الحالية.
 */
function resolveErrorLanguage(): string | undefined {
  if (import.meta.env.DEV) return 'ar'
  return i18next.language
}

/**
 * بيحوّل أي خطأ جاي من الـ API لرسالة جاهزة للعرض.
 * - كود معروف → ترجمة من ملفات الـ i18n.
 * - كود غير معروف + رسالة من الخادم → نعرض رسالة الخادم (زي تفاصيل CONFLICT).
 * - مفيش حاجة معروفة → رسالة عامة مترجمة.
 */
export function resolveApiErrorMessage(err: unknown, languageOverride?: string): string {
  const language = languageOverride ?? resolveErrorLanguage()
  const translate = (key: string): string =>
    language && language !== i18next.language ? i18next.getFixedT(language)(key) : i18next.t(key)

  const { code, message: serverMessage } = extractErrorEnvelope(err)

  // CONFLICT رسالته من الخادم بتفاصيل أدق (زي "البريد مستخدم بالفعل") — نفضلها لو موجودة.
  if (code === 'CONFLICT' && serverMessage) return serverMessage

  const key = code ? CODE_TO_KEY[code] : undefined
  if (key) return translate(key)

  if (serverMessage) return serverMessage
  return translate('errors.codes.generic')
}
