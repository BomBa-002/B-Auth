import { React, Tooltip, ThemeToggle, LanguageToggle, useTranslation } from '@a'
import { useLanguage, useTimeFormat } from '@features/settings/store/settings.store'
import type { SystemStatusBarProps } from './types'
import { useLiveClock } from './use-live-clock'

export function SystemStatusBar({ version = 'v1.0.0', brand = 'B-Auth', environment = 'PROD', tone = 'ready', label = 'ONLINE' }: SystemStatusBarProps) {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { timeFormat } = useTimeFormat()
  const clock = useLiveClock(language, timeFormat)
  return <footer className="status-bar" role="contentinfo">
    <div className="status-bar-zone status-bar-start">
      <Tooltip.Provider delayDuration={200}><Tooltip.Root><Tooltip.Trigger asChild><span className="online-badge" tabIndex={0}><span className={`status-bar-pulse status-bar-pulse-${tone}`} aria-hidden="true" />{label}</span></Tooltip.Trigger><Tooltip.Portal><Tooltip.Content className="status-bar-tooltip" side="top" align="start" sideOffset={8}><p className="status-bar-tooltip-row"><strong>{t('common.online_tooltip')}</strong></p><p className="status-bar-tooltip-row">{tone === 'error' ? t('common.online_error') : t('common.online_ready')}</p><Tooltip.Arrow className="status-bar-tooltip-arrow" /></Tooltip.Content></Tooltip.Portal></Tooltip.Root></Tooltip.Provider>
      <span className="status-bar-version">{version}</span>
      <span className="status-bar-environment">{environment}</span>
    </div>
    <div className="status-bar-zone status-bar-center"><span className="status-bar-brand">{brand}</span></div>
    <div className="status-bar-zone status-bar-end">
      <LanguageToggle /><ThemeToggle />
      <Tooltip.Provider delayDuration={200}><Tooltip.Root><Tooltip.Trigger asChild><span className="status-bar-clock ltr-only" tabIndex={0}>{clock.display}</span></Tooltip.Trigger><Tooltip.Portal><Tooltip.Content className="status-bar-tooltip" side="top" align="end" sideOffset={8}><p className="status-bar-tooltip-row"><strong>{t('common.cairo_24h')}</strong> {clock.cairo24h}</p><p className="status-bar-tooltip-row">{clock.gregorian}</p><p className="status-bar-tooltip-row">{clock.hijri}</p><Tooltip.Arrow className="status-bar-tooltip-arrow" /></Tooltip.Content></Tooltip.Portal></Tooltip.Root></Tooltip.Provider>
    </div>
  </footer>
}

void React
export default SystemStatusBar
