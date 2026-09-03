import { describe, expect, it } from 'vitest'
import { resolveApiErrorMessage } from './resolve-api-error'
import { i18next } from '@i18n/index'

/** بيبنّي خطأ axios وهمي بالشكل اللي الـ Backend بيرجّعه (ErrorEnvelope). */
function apiError(code?: string, message?: string) {
  return { response: { data: { error: { code, message } } } }
}

describe('resolveApiErrorMessage', () => {
  it('بيترجم كود معروف للعربية في وضع التطوير', () => {
    // vitest بيشتغل بـ import.meta.env.DEV = true → اللغة الإجبارية عربي
    expect(resolveApiErrorMessage(apiError('INVALID_CREDENTIALS'))).toBe(
      'اسم المستخدم أو كلمة المرور غير صحيحة'
    )
  })

  it('بيحترم تحديد اللغة يدوياً (إنجليزي)', () => {
    expect(resolveApiErrorMessage(apiError('INVALID_CREDENTIALS'), 'en')).toBe(
      'Invalid username or password'
    )
  })

  it('بيعرض رسالة الخادم لـ CONFLICT لأنها أدق', () => {
    expect(resolveApiErrorMessage(apiError('CONFLICT', 'Email already exists'))).toBe(
      'Email already exists'
    )
  })

  it('بيعرض رسالة الخادم للأكواد غير المعروفة', () => {
    expect(resolveApiErrorMessage(apiError('CUSTOM_CODE', 'Custom message'))).toBe('Custom message')
  })

  it('بيرجع رسالة عامة مترجمة لما مفيش أي معلومات', () => {
    const message = resolveApiErrorMessage(new Error('network failure'))
    expect(message).toBe(i18next.t('errors.codes.generic', { lng: 'ar' }))
  })
})
