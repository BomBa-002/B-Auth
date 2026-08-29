/**
 * @file        : Frontend/src/components/layout/system-status-bar/use-live-clock.ts
 * @description : ساعة حية بصيغة 12 ساعة، مع تفاصيل تلميح (24 ساعة بتوقيت القاهرة، الميلادي، والهجري أم القرى).
 * @updated     : [{ "date": "27/08/2026", "version": "1.0.0", "by": ["v0"], "comment": "إنشاء الساعة الحية لشريط الحالة الجديد" }]
 */

import { React } from '@a'
import type { AppLanguage } from '@features/settings/store/settings.store'

const CAIRO_TIMEZONE = 'Africa/Cairo'

export interface LiveClockValue {
  /** الوقت المعروض في الشريط، مثل "06:08 AM". */
  display: string
  /** توقيت القاهرة بصيغة 24 ساعة، مثل "06:08". */
  cairo24h: string
  /** التاريخ الميلادي المنسّق، مثل "Tuesday : 12 - (05 - May) - 2026 AD". */
  gregorian: string
  /** التاريخ الهجري (أم القرى) المنسّق، مثل "Tuesday : 25 - (11 - Dhu al-Qi'dah) - 1447 AH". */
  hijri: string
}

function partsToMap(parts: Intl.DateTimeFormatPart[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (const part of parts) map[part.type] = part.value
  return map
}

function formatNamedDate(date: Date, calendar: 'gregory' | 'islamic-umalqura', locale: string): string {
  const parts = partsToMap(
    new Intl.DateTimeFormat(locale, {
      calendar,
      timeZone: CAIRO_TIMEZONE,
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      era: 'short',
    }).formatToParts(date)
  )
  const monthName = new Intl.DateTimeFormat(locale, { calendar, timeZone: CAIRO_TIMEZONE, month: 'long' }).format(date)
  return `${parts.weekday ?? ''} : ${parts.day ?? ''} - (${parts.month ?? ''} - ${monthName}) - ${parts.year ?? ''} ${parts.era ?? ''}`
}

/** يعيد الوقت الحالي، ويحدّثه كل دقيقة كافية لعرض 12 ساعة، مع تفاصيل التلميح الكاملة. */
export function useLiveClock(language: AppLanguage, timeFormat: '12' | '24'): LiveClockValue {
  const [now, setNow] = React.useState(() => new Date())

  React.useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(interval)
  }, [])

  return React.useMemo(() => {
    const locale = language === 'ar' ? 'ar-EG' : 'en-US'
    const display = new Intl.DateTimeFormat(locale, {
      timeZone: CAIRO_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12',
    }).format(now)

    const cairo24h = new Intl.DateTimeFormat(locale, {
      timeZone: CAIRO_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now)

    return {
      display,
      cairo24h,
      gregorian: formatNamedDate(now, 'gregory', locale),
      hijri: formatNamedDate(now, 'islamic-umalqura', locale),
    }
  }, [language, now, timeFormat])
}
