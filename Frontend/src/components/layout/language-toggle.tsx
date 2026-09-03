import { IconLanguages } from '@b-auth/design-system/icon-registry'
import { i18next } from '@i18n/index'
import * as Tooltip from '@radix-ui/react-tooltip'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '@features/settings/store/settings.store'
import { useRouter, useRouterState } from '@tanstack/react-router'

export function LanguageToggle() {
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguage()
  const router = useRouter()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const nextLanguage = language === 'ar' ? 'en' : 'ar'
  const label = nextLanguage === 'ar' ? t('common.language_ar') : t('common.language_en')

  // تبديل اللغة بيعدّل الـ URL نفسه (مثل /en/home → /ar/home) — والـ router بيزامن الإعدادات منه.
  const toggleLanguage = () => {
    setLanguage(nextLanguage)
    void i18next.changeLanguage(nextLanguage)
    void router.navigate({ to: pathname.replace(/^\/(en|ar)(?=\/|$)/, `/${nextLanguage}`) })
  }

  return (
    <Tooltip.Provider delayDuration={250}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button className="status-bar-icon-button" type="button" tabIndex={-1} onClick={toggleLanguage} aria-label={`${t('common.language')}: ${label}`}>
            <IconLanguages size={16} aria-hidden="true" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="status-bar-tooltip status-bar-control-tooltip" side="top" align="center" sideOffset={8}>
            {`${t('common.language')}: ${label}`}
            <Tooltip.Arrow className="status-bar-tooltip-arrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
