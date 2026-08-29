/**
 * @file        : Frontend/src/alias/index.ts
 * @description : نقطة الاستيراد المركزية للواجهة الأمامية.
 * @updated     : [{ "date": "26/08/2026", "version": "1.0.0", "by": ["v0"], "comment": "استعادة نقطة الدخول" }]
 */

/**
 * @file        : Frontend/src/alias/index.ts
 * @description : نقطة الاستيراد المركزية للواجهة الأمامية.
 * @updated     : [{ "date": "27/08/2026", "version": "1.2.0", "by": ["v0"], "comment": "إضافة التوجيه، النماذج، والمكوّنات المشتركة لتدفق splash/error/signin/signup/home" }]
 */

export { default as React, createElement } from 'react'
export type { SVGProps } from 'react'
export { createRoot } from 'react-dom/client'
export { QueryClient } from '@tanstack/react-query'
export {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  Link,
  useNavigate,
  useRouter,
  redirect,
  notFound,
} from '@tanstack/react-router'
export type { ErrorComponentProps } from '@tanstack/react-router'
export { Slot } from '@radix-ui/react-slot'
export * as Tooltip from '@radix-ui/react-tooltip'
export { cva } from 'class-variance-authority'
export type { VariantProps } from 'class-variance-authority'
export { default as axios } from 'axios'
export type { AxiosError, InternalAxiosRequestConfig } from 'axios'
export { useForm, Controller } from 'react-hook-form'
export type { SubmitHandler } from 'react-hook-form'
export { zodResolver } from '@hookform/resolvers/zod'
export { z } from 'zod'
export { useTranslation } from 'react-i18next'
export { i18next } from '@i18n/index'
export { cn } from '@b-auth/utils'
export { OutlinedInput } from '@b-auth/design-system/components/outlined-input'
export type { OutlinedInputProps } from '@b-auth/design-system/components/outlined-input'
export { SmartInput } from '@b-auth/design-system/components/smart-input'
export type { SmartInputProps, T_SmartInputProps, Suggestion, T_Suggestion, ValidationTone } from '@b-auth/design-system/components/smart-input'
export { Logo } from '@components/ui/logo'
export * from '@b-auth/design-system/icon-registry'
export { apiClient, configureHttp } from '@lib/api-client'
export { useAuthStore } from '@features/auth/store/auth.store'
export type { AuthUser, BootstrapStatus } from '@features/auth/store/auth.store'
export { useSettingsStore, useTheme, useLanguage, useTimeFormat, applySettingsToDocument, getResolvedTheme } from '@features/settings/store/settings.store'
export type { ThemePreference, AppLanguage, BackgroundMotion } from '@features/settings/store/settings.store'
export { ThemeToggle } from '@components/layout/theme-toggle'
export { LanguageToggle } from '@components/layout/language-toggle'
export { AppBackground } from '@components/app-background'
export { features } from '@app/features'
