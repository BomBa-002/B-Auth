import { React, useTranslation } from '@a'
import { ScreenLayout } from '@components/layout/screen-layout'
import { Logo } from '@components/ui/logo'
import type { BootstrapStatus } from '@features/auth/store/auth.store'

type BootState = 'done' | 'active' | 'pending'

export function SplashScreen({ status }: { status: BootstrapStatus }) {
  const { t } = useTranslation()
  const healthState: BootState = status === 'running' || status === 'retrying' || status === 'idle' ? 'active' : 'done'
  const sessionState: BootState = status === 'running' ? 'active' : status === 'ready' || status === 'degraded' ? 'done' : 'pending'
  const configState: BootState = status === 'ready' || status === 'degraded' ? 'done' : 'pending'
  const progress = status === 'ready' || status === 'degraded' ? 100 : status === 'running' ? 68 : 46

  return (
    <ScreenLayout statusLabel={t('splash.status_starting')} statusTone="busy" version="v1.1.0" brand="B-Learning" environment="PROD">
      <div className="splash-screen" aria-labelledby="splash-title">
        <div className="splash-identity">
          <div className="splash-brand"><Logo aria-label={t('app.name')} /></div>
          <h1 id="splash-title">{t('app.name')}</h1>
          <p>{t('app.tagline')}</p>
        </div>

        <div className="boot-ring" style={{ '--progress': `${progress * 3.6}deg` } as React.CSSProperties} aria-label={`${progress}%`}>
          <div className="boot-ring-center"><strong>{progress}%</strong></div>
        </div>

        <div className="terminal-logs" aria-live="polite">
          <BootStep state="done" label={t('splash.steps.modules')} />
          <BootStep state="done" label={t('splash.steps.security')} />
          <BootStep state={healthState} label={t('splash.steps.health')} />
          <BootStep state={sessionState} label={t('splash.steps.session')} />
          <BootStep state={configState} label={t('splash.steps.config')} />
        </div>
      </div>
    </ScreenLayout>
  )
}

function BootStep({ state, label }: { state: BootState; label: string }) {
  return <div className="terminal-row" data-state={state}><span className="terminal-arrow">&gt;</span><span className="terminal-label">{label}{state === 'active' ? <span className="terminal-dots" aria-label="loading">...</span> : null}</span><span className="terminal-indicator" aria-hidden="true">{state === 'done' ? '✓' : state === 'active' ? '' : '•'}</span></div>
}

void React
export default SplashScreen
