/**
 * @file        : Frontend/src/app/features.ts
 * @description : أعلام تفعيل الميزات القابلة للتحكم بها من قِبل المطوّر يدوياً.
 */

export interface FeatureFlags {
  /**
   * تفعيل/تعطيل شاشة ومسار التسجيل (`/signup`) بالكامل.
   * الوضع الافتراضي: `false` — عندما تكون معطّلة، أي محاولة للوصول إلى
   * `/signup` تُعاد توجيهها إلى `/signin`.
   */
  ENABLE_SIGNUP: boolean
  /**
   * يتحكم في السلوك بعد نجاح التسجيل (فقط عندما تكون `ENABLE_SIGNUP` مفعّلة):
   * - `false` (الافتراضي): عرض رسالة نجاح فقط، بدون تسجيل دخول تلقائي.
   * - `true`: تسجيل دخول تلقائي بنفس بيانات الاعتماد ثم التوجيه إلى `/home`.
   */
  AUTO_LOGIN_AFTER_SIGNUP: boolean
  /** تفعيل مدة ظهور Splash الاختيارية للمطور، بين 3 و10 ثواني. */
  ENABLE_SPLASH_MIN_DURATION: boolean
  /** مدة ظهور Splash بالمللي ثانية عند التفعيل. */
  SPLASH_MIN_DURATION_MS: number
}

export const features: FeatureFlags = {
  ENABLE_SIGNUP: false,
  AUTO_LOGIN_AFTER_SIGNUP: false,
  ENABLE_SPLASH_MIN_DURATION: true,
  SPLASH_MIN_DURATION_MS: 5000,
}
