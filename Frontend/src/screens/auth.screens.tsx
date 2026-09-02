import { React, SmartInput, useAuthStore, useTranslation } from '@a'
import { login, register } from '@services/auth.service'
import { ScreenLayout } from '@components/layout/screen-layout'
import { Logo } from '@components/ui/logo'
import { resolveAuthErrorMessage } from '@features/auth/lib/resolve-auth-error'

interface AuthScreenProps { onNavigate: (screen: string) => void }

export function SigninScreen({ onNavigate }: AuthScreenProps) {
  const { t } = useTranslation()
  const rememberedUsername = useAuthStore((s) => s.rememberedUsername)
  const setRememberedUsername = useAuthStore((s) => s.setRememberedUsername)
  const setSession = useAuthStore((s) => s.setSession)
  const [username, setUsername] = React.useState(rememberedUsername ?? '')
  const [password, setPassword] = React.useState('')
  const [remember, setRemember] = React.useState(Boolean(rememberedUsername))
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setLoading(true)
    try { const session = await login({ identifier: username, password, rememberMe: remember }); if (remember) setRememberedUsername(username); else setRememberedUsername(null); setSession({ accessToken: session.accessToken, user: session.user, persistent: session.persistent }); onNavigate('home') }
    catch (error) { setError(resolveAuthErrorMessage(error, t)) } finally { setLoading(false) }
  }

  return <ScreenLayout statusLabel={t('auth.status')} statusTone="busy"><AuthFrame title={t('auth.login_title')} subtitle={t('auth.login_subtitle')}><form className="form-card auth-form" onSubmit={handleSubmit}>{error && <div className="form-error-banner" role="alert">{error}</div>}<SmartInput label={t('auth.username_label')} placeholder={t('auth.username_placeholder')} value={username} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} autoComplete="username" clearable required /><SmartInput label={t('auth.password_label')} placeholder={t('auth.password_placeholder')} type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} autoComplete="current-password" clearable required /><div className="auth-options"><label className="checkbox-row"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />{t('auth.remember_me')}</label><button className="link-action" type="button">{t('auth.forgot_password')}</button></div><button className="primary-action" type="submit" disabled={loading}>{loading ? t('auth.submitting') : t('auth.submit')}</button><div className="form-footer-links"><span>{t('auth.no_account')}</span><button className="link-action" type="button" onClick={() => onNavigate('signup')}>{t('auth.create_account')}</button></div></form></AuthFrame></ScreenLayout>
}

export function SignupScreen({ onNavigate }: AuthScreenProps) {
  const { t } = useTranslation(); const [form, setForm] = React.useState({ username: '', email: '', displayName: '', password: '' }); const [message, setMessage] = React.useState(''); const [error, setError] = React.useState(''); const [loading, setLoading] = React.useState(false)
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setError(''); setMessage(''); setLoading(true); try { await register(form); setMessage(t('auth.signup_success_body')) } catch (error) { setError(resolveAuthErrorMessage(error, t)) } finally { setLoading(false) } }
  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, [key]: event.target.value }))
  return <ScreenLayout statusLabel={t('auth.registration_status')} statusTone="busy"><AuthFrame title={t('auth.signup_title')} subtitle={t('auth.signup_subtitle')}><form className="form-card auth-form" onSubmit={handleSubmit}>{error && <div className="form-error-banner" role="alert">{error}</div>}{message && <div className="success-banner" role="status"><span className="screen-icon-badge tone-success">✓</span><p className="screen-subtitle">{message}</p><button className="link-action" type="button" onClick={() => onNavigate('signin')}>{t('auth.signup_success_action')}</button></div>}<SmartInput label={t('auth.display_name_label')} placeholder={t('auth.display_name_placeholder')} value={form.displayName} onChange={update('displayName')} autoComplete="name" clearable required /><SmartInput label={t('auth.username_label')} placeholder={t('auth.username_placeholder')} value={form.username} onChange={update('username')} autoComplete="username" clearable required /><SmartInput label={t('auth.email_label')} placeholder={t('auth.email_placeholder')} type="email" value={form.email} onChange={update('email')} autoComplete="email" clearable required /><SmartInput label={t('auth.password_label')} placeholder={t('auth.password_placeholder')} type="password" value={form.password} onChange={update('password')} autoComplete="new-password" clearable minLength={8} required /><button className="primary-action" type="submit" disabled={loading}>{loading ? t('auth.signup_submitting') : t('auth.signup_submit')}</button><div className="form-footer-links"><span>{t('auth.have_account')}</span><button className="link-action" type="button" onClick={() => onNavigate('signin')}>{t('auth.go_to_signin')}</button></div></form></AuthFrame></ScreenLayout>
}

function AuthFrame({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const { t } = useTranslation()
  return <div className="screen-body auth-body"><aside className="auth-intro"><div className="auth-brand"><Logo aria-label={t('app.name')} /></div><span className="eyebrow">{t('auth.eyebrow')}</span><p className="auth-intro-copy">{t('splash.subtitle')}</p><div className="auth-security-note"><span aria-hidden="true">✓</span><span>{t('splash.secure_portal')}</span></div></aside><section className="auth-panel" aria-labelledby="auth-title"><div className="auth-heading"><span className="console-kicker">B-AUTH / ACCESS GATE</span><h1 id="auth-title" className="screen-title">{title}</h1><p className="screen-subtitle">{subtitle}</p></div>{children}</section></div>
}
export default SigninScreen
