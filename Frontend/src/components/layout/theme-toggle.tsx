/**
 * @file        : Frontend/src/components/layout/theme-toggle.tsx
 * @description : زر تبديل الوضع الفاتح والداكن مع دعم لوحة المفاتيح.
 * @updated     : [{ "date": "27/08/2026", "version": "1.0.0", "by": ["v0"], "comment": "إنشاء زر الثيم" }]
 */

import { IconMoon, IconSun, Tooltip, useTranslation } from '@a'
import { useTheme } from '@features/settings/store/settings.store'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const { t } = useTranslation()
  const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
  const label = nextTheme === 'dark' ? t('common.switch_to_dark') : t('common.switch_to_light')

  return (
    <Tooltip.Provider delayDuration={250}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button className="status-bar-icon-button" type="button" tabIndex={-1} onClick={() => setTheme(nextTheme)} aria-label={label}>
            {resolvedTheme === 'dark' ? <IconSun size={16} aria-hidden="true" /> : <IconMoon size={16} aria-hidden="true" />}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="status-bar-tooltip status-bar-control-tooltip" side="top" align="center" sideOffset={8}>
            {label}
            <Tooltip.Arrow className="status-bar-tooltip-arrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
