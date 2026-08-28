import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import ar from './locales/ar.json'
import { useSettingsStore } from '@features/settings/store/settings.store'

const supportedLanguages = ['en', 'ar'] as const
export const SUPPORTED_LANGUAGES = supportedLanguages
export type SupportedLanguage = (typeof supportedLanguages)[number]
export const RTL_LANGUAGES: readonly SupportedLanguage[] = ['ar']

export function normalizeLanguage(language?: string): SupportedLanguage {
  return language?.toLowerCase().startsWith('ar') ? 'ar' : 'en'
}

export function isRtl(language: string): boolean {
  return RTL_LANGUAGES.includes(normalizeLanguage(language))
}

export function applyDocumentDirection(language: string): void {
  const normalized = normalizeLanguage(language)
  document.documentElement.lang = normalized
  document.documentElement.dir = isRtl(normalized) ? 'rtl' : 'ltr'
}

void i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, ar: { translation: ar } },
    lng: useSettingsStore.getState().language,
    supportedLngs: SUPPORTED_LANGUAGES,
    fallbackLng: 'en',
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'], lookupLocalStorage: 'b-auth:lang' },
    interpolation: { escapeValue: false },
  })

i18next.on('languageChanged', applyDocumentDirection)
applyDocumentDirection(normalizeLanguage(i18next.language))
export { i18next }
export default i18next
