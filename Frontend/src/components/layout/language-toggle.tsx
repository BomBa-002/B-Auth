import { IconLanguages, i18next, Tooltip, useTranslation } from '@a'
import { useLanguage } from '@features/settings/store/settings.store'

export function LanguageToggle() {
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguage()
  const nextLanguage = language === 'ar' ? 'en' : 'ar'
  const label = nextLanguage === 'ar' ? t('common.language_ar') : t('common.language_en')

  return (
    <Tooltip.Provider delayDuration={250}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button className="status-bar-icon-button" type="button" tabIndex={-1} onClick={() => { setLanguage(nextLanguage); void i18next.changeLanguage(nextLanguage) }} aria-label={`${t('common.language')}: ${label}`}>
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
