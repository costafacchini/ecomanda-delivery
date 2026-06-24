import { fireEvent, render, screen } from '@testing-library/react'
import { LanguageSwitcher } from '.'

const mockChangeLanguage = vi.fn()

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'pt', changeLanguage: mockChangeLanguage },
  }),
}))

describe('<LanguageSwitcher />', () => {
  it('renders PT and EN buttons', () => {
    render(<LanguageSwitcher />)

    expect(screen.getByText('PT')).toBeInTheDocument()
    expect(screen.getByText('EN')).toBeInTheDocument()
  })

  it('applies btn-secondary to the active language (PT) and btn-outline-secondary to the inactive one (EN)', () => {
    render(<LanguageSwitcher />)

    expect(screen.getByText('PT').className).toContain('btn-secondary')
    expect(screen.getByText('PT').className).not.toContain('btn-outline-secondary')
    expect(screen.getByText('EN').className).toContain('btn-outline-secondary')
  })

  it('calls i18n.changeLanguage with "en" when EN button is clicked', () => {
    render(<LanguageSwitcher />)

    fireEvent.click(screen.getByText('EN'))

    expect(mockChangeLanguage).toHaveBeenCalledWith('en')
  })

  it('calls i18n.changeLanguage with "pt" when PT button is clicked', () => {
    render(<LanguageSwitcher />)

    fireEvent.click(screen.getByText('PT'))

    expect(mockChangeLanguage).toHaveBeenCalledWith('pt')
  })
})
