import { React, useTranslation } from '@a'
import { SystemStatusBar } from '@components/layout/system-status-bar'
import type { StatusTone } from '@components/layout/system-status-bar'
import { useHealthStore } from '@features/health/health.store'

export interface ScreenLayoutProps { statusLabel?: string; statusTone?: StatusTone; version?: string; brand?: string; environment?: string; children: React.ReactNode }

export function ScreenLayout({ statusLabel, statusTone = 'ready', version = 'v1.0.0', brand = 'B-Auth', environment = 'PROD', children }: ScreenLayoutProps) {
  const { t } = useTranslation()
  // حالة النظام في الشريط بتتبع المراقبة الحية: انقطاع → متوقف، تدهور → مشكلة، سليم → حالة الشاشة نفسها.
  const level = useHealthStore((state) => state.health.level)
  const liveTone: StatusTone = level === 'critical' ? 'error' : level === 'degraded' ? 'busy' : statusTone
  const liveLabel = level === 'critical' ? t('common.system_down') : level === 'degraded' ? t('common.system_degraded') : (statusLabel ?? t('common.system_ready'))
  return <main className="app-shell"><section className="console-card" aria-labelledby="page-title">{children}<SystemStatusBar version={version} brand={brand} environment={environment} tone={liveTone} label={liveLabel} /></section></main>
}
