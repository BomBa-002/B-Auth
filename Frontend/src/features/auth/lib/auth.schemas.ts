/**
 * @file        : Frontend/src/features/auth/lib/auth.schemas.ts
 * @description : مخططات zod لنماذج تسجيل الدخول والتسجيل — رسائل الخطأ مترجمة عبر i18n.
 * @updated     : [{ "date": "02/09/2026", "version": "1.0.0", "by": ["v0"], "comment": "إنشاء المخططات لاستخدامها مع react-hook-form" }]
 */

import { z } from 'zod'

/** نوع دالة الترجمة المطلوبة لبناء الرسائل — بنستخدم TFunction بشكل فضفاض لتجنب اقتران بنسخة i18next. */
type Translate = (key: string, options?: Record<string, unknown>) => string

/** اسم مستخدم: 3-32 حرف/رقم مع نقطة أو شرطة سفلية أو شرطة عادية. */
const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]+$/

/** رقم جوال: اختياري، بصيغة دولية أو محلية، أرقام مع + ومسافات وشرطات. */
const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{6,19}$/

/**
 * مخطط تسجيل الدخول — identifier يقبل username أو email أو phone.
 * @param t - دالة الترجمة لرسائل التحقق.
 * @returns مخطط zod جاهز للـ resolver.
 */
export function createSigninSchema(t: Translate) {
  return z.object({
    identifier: z.string().min(1, t('validation.required')),
    password: z.string().min(1, t('validation.required')),
  })
}
export type SigninFormValues = z.infer<ReturnType<typeof createSigninSchema>>

/**
 * مخطط إنشاء حساب — يطابق قواعد الـ Backend في auth.schemas.ts.
 * @param t - دالة الترجمة لرسائل التحقق.
 * @returns مخطط zod جاهز للـ resolver.
 */
export function createSignupSchema(t: Translate) {
  return z.object({
    displayName: z.string().min(1, t('validation.required')),
    username: z
      .string()
      .min(3, t('validation.min_length', { count: 3 }))
      .max(32)
      .regex(USERNAME_PATTERN, t('validation.invalid_username')),
    email: z.string().email(t('validation.invalid_email')),
    phone: z.union([z.string().regex(PHONE_PATTERN, t('validation.invalid_phone')), z.literal('')]).optional(),
    password: z.string().min(8, t('validation.min_length', { count: 8 })),
  })
}
export type SignupFormValues = z.infer<ReturnType<typeof createSignupSchema>>
