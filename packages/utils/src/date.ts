import dayjs, { type Dayjs } from "dayjs"

/**
 * Locale-aware date helpers. Callers pass the active i18n locale explicitly —
 * this module never reads global state, keeping it framework-agnostic.
 */

export function formatDate(input: string | number | Date, locale = "en"): string {
  return dayjs(input).locale(locale).format("D MMM YYYY")
}

export function formatDateTime(input: string | number | Date, locale = "en"): string {
  return dayjs(input).locale(locale).format("D MMM YYYY, HH:mm")
}

export function fromNow(input: string | number | Date): string {
  const now = dayjs()
  const then = dayjs(input)
  const diffMinutes = now.diff(then, "minute")
  if (diffMinutes < 1) return "just now"
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = now.diff(then, "hour")
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = now.diff(then, "day")
  return `${diffDays}d ago`
}

export function isExpired(expiresAtIso: string): boolean {
  return dayjs().isAfter(dayjs(expiresAtIso))
}

export type { Dayjs }
