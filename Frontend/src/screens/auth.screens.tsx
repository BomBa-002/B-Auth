import { React, SmartButton, SmartInput, useAuthStore, useTranslation, useForm, zodResolver } from '@a'
import { login, register as registerAccount } from '@services/auth.service'
import { ScreenLayout } from '@components/layout/screen-layout'
import { Logo } from '@components/ui/logo'
import { resolveAuthErrorMessage } from '@features/auth/lib/resolve-auth-error'
import { createSigninSchema, createSignupSchema } from '@features/auth/lib/auth.schemas'
import type { SigninFormValues, SignupFormValues } from '@features/auth/lib/auth.schemas'

interface AuthScreenProps { onNavigate: (screen: string) => void }

export function SigninScreen({ onNavigate }: AuthScreenProps) {
  const { t } = useTranslation()
  const rememberedUsername = useAuthStore((s) => s.rememberedUsername)
  const setRememberedUsername = useAuthStore((s) => s.setRememberedUsername)
  const setSession = useAuthStore((s) => s.setSession)
  const [serverError, setServerError] = React.useState('')
  // rememberMe مش جزء من تحقق zod — حالة UI مستقلة لأنها بتتحكم في persistence مش في صحة الإدخال.
  const [remember, setRemember] = React.useState(Boolean(rememberedUsername))

  const { register, handleSubmit, formState } = useForm<SigninFormValues>({
    resolver: zodResolver(createSigninSchema(t)),
    defaultValues: { identifier: rememberedUsername ?? '', password: '' },
  })

  const onSubmit = handleSubmit(async (values: SigninFormValues) => {
    setServerError('')
    try {
      const session = await login({ identifier: values.identifier, password: values.password, rememberMe: remember })
      if (remember) setRememberedUsername(values.identifier)
      else setRememberedUsername(null)
      setSession({ accessToken: session.accessToken, user: session.user, persistent: session.persistent })
      onNavigate('home')
    } catch (error) {
      setServerError(resolveAuthErrorMessage(error, t))
    }
  })

  return <ScreenLayout statusLabel={t('auth.status')} statusTone="busy"><AuthFrame title={t('auth.login_title')} subtitle={t('auth.login_subtitle')}><form className="form-card auth-form" onSubmit={onSubmit} noValidate>{serverError && <div className="form-error-banner" role="alert">{serverError}</div>}<SmartInput label={t('auth.username_label')} placeholder={t('auth.username_placeholder')} error={formState.errors.identifier?.message} autoComplete="username" clearable {...register('identifier')} /><SmartInput label={t('auth.password_label')} placeholder={t('auth.password_placeholder')} type="password" error={formState.errors.password?.message} autoComplete="current-password" clearable {...register('password')} /><div className="auth-options"><label className="checkbox-row"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />{t('auth.remember_me')}</label><button className="link-action" type="button">{t('auth.forgot_password')}</button></div><SmartButton className="primary-action" type="submit" loading={formState.isSubmitting} lockKey="auth:login">{formState.isSubmitting ? t('auth.submitting') : t('auth.submit')}</SmartButton></form></AuthFrame></ScreenLayout>
}

export function SignupScreen({ onNavigate }: AuthScreenProps) {
  const { t } = useTranslation()
  const [message, setMessage] = React.useState('')
  const [serverError, setServerError] = React.useState('')

  const { register, handleSubmit, reset, formState } = useForm<SignupFormValues>({
    resolver: zodResolver(createSignupSchema(t)),
    defaultValues: { displayName: '', username: '', email: '', phone: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values: SignupFormValues) => {
    setServerError(''); setMessage('')
    try {
      await register({ ...values, phone: values.phone || undefined })
      setMessage(t('auth.signup_success_body'))
      reset()
    } catch (error) {
      setServerError(resolveAuthErrorMessage(error, t))
    }
  })

  return <ScreenLayout statusLabel={t('auth.registration_status')} statusTone="busy"><AuthFrame title={t('auth.signup_title')} subtitle={t('auth.signup_subtitle')}><form className="form-card" onSubmit={onSubmit} noValidate>{serverError && <div className="form-error-banner" role="alert">{serverError}</div>}{message && <div className="success-banner" role="status"><span className="screen-icon-badge tone-success">✓</span><p className="screen-subtitle">{message}</p><button className="link-action" type="button" onClick={() => onNavigate('signin')}>{t('auth.signup_success_action')}</button></div>}<SmartInput label={t('auth.display_name_label')} placeholder={t('auth.display_name_placeholder')} error={formState.errors.displayName?.message} autoComplete="name" clearable {...register('displayName')} /><SmartInput label={t('auth.username_label')} placeholder={t('auth.username_placeholder')} error={formState.errors.username?.message} autoComplete="username" clearable {...register('username')} /><SmartInput label={t('auth.email_label')} placeholder={t('auth.email_placeholder')} type="email" error={formState.errors.email?.message} autoComplete="email" clearable {...register('email')} /><SmartInput label={t('auth.phone_label')} placeholder={t('auth.phone_placeholder')} type="tel" error={formState.errors.phone?.message} autoComplete="tel" clearable {...register('phone')} /><SmartInput label={t('auth.password_label')} placeholder={t('auth.password_placeholder')} type="password" error={formState.errors.password?.message} autoComplete="new-password" clearable minLength={8} {...register('password')} /><SmartButton className="primary-action" type="submit" loading={formState.isSubmitting} lockKey="auth:register">{formState.isSubmitting ? t('auth.signup_submitting') : t('auth.signup_submit')}</SmartButton><div className="form-footer-links"><span>{t('auth.have_account')}</span><button className="link-action" type="button" onClick={() => onNavigate('signin')}>{t('auth.go_to_signin')}</button></div></form></AuthFrame></ScreenLayout>
}

function AuthFrame({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const { t } = useTranslation()
  return <div className="auth-layout"><aside className="auth-aside" aria-label={t('auth.eyebrow')}><div className="auth-aside-brand"><Logo aria-label={t('app.name')} /></div><p className="eyebrow">{t('splash.eyebrow')}</p><h2>{t('app.name')}</h2><p>{t('app.tagline')}</p><div className="auth-aside-list"><span>{t('splash.steps.modules')}</span><span>{t('splash.steps.security')}</span><span>{t('splash.steps.session')}</span></div></aside><div className="screen-body auth-body"><div className="auth-brand"><Logo aria-label={t('app.name')} /></div><div className="auth-heading"><p className="eyebrow">{t('auth.eyebrow')}</p><h1 className="screen-title">{title}</h1><p className="screen-subtitle">{subtitle}</p></div>{children}</div></div>
}
export default SigninScreen
