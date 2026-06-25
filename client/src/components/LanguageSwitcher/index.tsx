import { useTranslation } from 'react-i18next'

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { i18n } = useTranslation()
  const active = i18n.language as 'pt' | 'en'

  return (
    <div className={`btn-group ${className ?? ''}`} role="group" aria-label="Language">
      <button
        type="button"
        className={`btn btn-sm ${active === 'pt' ? 'btn-secondary' : 'btn-outline-secondary'}`}
        onClick={() => i18n.changeLanguage('pt')}
      >
        PT
      </button>
      <button
        type="button"
        className={`btn btn-sm ${active === 'en' ? 'btn-secondary' : 'btn-outline-secondary'}`}
        onClick={() => i18n.changeLanguage('en')}
      >
        EN
      </button>
    </div>
  )
}
