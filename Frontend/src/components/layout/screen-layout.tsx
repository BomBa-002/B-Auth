import { React, useTranslation } from '@a'
import { SystemStatusBar } from '@components/layout/system-status-bar'
import type { StatusTone } from '@components/layout/system-status-bar'

export interface ScreenLayoutProps { statusLabel?: string; statusTone?: StatusTone; version?: string; brand?: string; environment?: string; children: React.ReactNode }

export function ScreenLayout({ statusLabel, statusTone = 'ready', version = 'v1.0.0', brand = 'B-Auth', environment = 'PROD', children }: ScreenLayoutProps) {
  const { t } = useTranslation()
  return <main className="app-shell"><section className="console-card" aria-labelledby="page-title">{children}<SystemStatusBar version={version} brand={brand} environment={environment} tone={statusTone} label={statusLabel ?? t('common.system_ready')} /></section></main>
}
