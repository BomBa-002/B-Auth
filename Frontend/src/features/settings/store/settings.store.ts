/**
 * @file        : Frontend/src/features/settings/store/settings.store.ts
 * @description : مخزن Zustand لحفظ الثيم واللغة بين جلسات التطبيق.
 * @updated     : [{ "date": "27/08/2026", "version": "1.0.0", "by": ["v0"], "comment": "إضافة إعدادات الثيم واللغة" }]
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemePreference = 'light' | 'dark' | 'system'
export type AppLanguage = 'en' | 'ar'
export type BackgroundMotion = 'full' | 'calm' | 'off'

/**
 * اللغة الابتدائية بتتبع لغة النظام (عربي → عربي، غير كده → إنجليزي).
 * اختيار المستخدم بيتحفظ في الـ persist فيتفوق على القيمة دي من أول تغيير.
 */
function detectInitialLanguage(): AppLanguage {
  if (typeof navigator === 'undefined') return 'en'
  return navigator.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en'
}

export interface SettingsState {
  theme: ThemePreference
  language: AppLanguage
  timeFormat: '12' | '24'
  showBackground: boolean
  backgroundMotion: BackgroundMotion
  showFocusRing: boolean
  setTheme: (theme: ThemePreference) => void
  setTimeFormat: (timeFormat: '12' | '24') => void
  setLanguage: (language: AppLanguage) => void
  setShowBackground: (showBackground: boolean) => void
  toggleBackground: () => void
  setBackgroundMotion: (backgroundMotion: BackgroundMotion) => void
  setShowFocusRing: (showFocusRing: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: detectInitialLanguage(),
      timeFormat: '12',
      showBackground: true,
      backgroundMotion: 'full',
      showFocusRing: false,
      setTheme: (theme) => set({ theme }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      setLanguage: (language) => set({ language }),
      setShowBackground: (showBackground) => set({ showBackground }),
      toggleBackground: () => set((state) => ({ showBackground: !state.showBackground })),
      setBackgroundMotion: (backgroundMotion) => set({ backgroundMotion }),
      setShowFocusRing: (showFocusRing) => set({ showFocusRing }),
    }),
    {
      name: 'vh-settings',
      version: 1,
    },
  ),
)

export function getResolvedTheme(theme: ThemePreference): 'light' | 'dark' {
  if (theme !== 'system') return theme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applySettingsToDocument(theme: ThemePreference, language: AppLanguage, showFocusRing = false): void {
  const root = document.documentElement
  root.dataset.theme = getResolvedTheme(theme)
  root.dataset.focusRing = showFocusRing ? 'visible' : 'hidden'
  root.lang = language
  root.dir = language === 'ar' ? 'rtl' : 'ltr'
  root.style.colorScheme = getResolvedTheme(theme)
}

export function useTheme() {
  const theme = useSettingsStore((state) => state.theme)
  const setTheme = useSettingsStore((state) => state.setTheme)
  const resolvedTheme = getResolvedTheme(theme)
  return { theme, resolvedTheme, setTheme }
}

export function useLanguage() {
  const language = useSettingsStore((state) => state.language)
  const setLanguage = useSettingsStore((state) => state.setLanguage)
  return { language, setLanguage }
}

export function useTimeFormat() {
  const timeFormat = useSettingsStore((state) => state.timeFormat)
  const setTimeFormat = useSettingsStore((state) => state.setTimeFormat)
  return { timeFormat, setTimeFormat }
}
