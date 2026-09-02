/// <reference types="vite/client" />

/** متغيرات البيئة المتاحة للواجهة — كلها بتتعرض للعميل فممنوع فيها أسرار. */
interface ImportMetaEnv {
  /** DSN بتاع Sentry — اختياري. */
  readonly VITE_SENTRY_DSN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
