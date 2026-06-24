import { render, screen } from '@testing-library/react'
import LicenseeContactsCard from './LicenseeContactsCard'
import { getDashboardContacts } from '../../../services/dashboard'

vi.mock('../../../services/dashboard')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

describe('<LicenseeContactsCard />', () => {
  it('shows loading state while the request is in flight', () => {
    getDashboardContacts.mockReturnValue(new Promise(() => {}))

    render(<LicenseeContactsCard />)

    expect(screen.getByText('common.loading')).toBeInTheDocument()
  })

  it('shows an error message when the request fails', async () => {
    getDashboardContacts.mockRejectedValue(new Error('fail'))

    render(<LicenseeContactsCard />)

    expect(await screen.findByText('dashboard.loadError')).toBeInTheDocument()
  })

  it('renders total and chatbot contact counts on success', async () => {
    getDashboardContacts.mockResolvedValue({
      data: { total: 500, in_chatbot: 120 },
    })

    render(<LicenseeContactsCard />)

    expect(await screen.findByText('500')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('dashboard.contacts.cardTitle')).toBeInTheDocument()
    expect(screen.getByText('dashboard.contacts.total')).toBeInTheDocument()
    expect(screen.getByText('dashboard.contacts.inChatbot')).toBeInTheDocument()
  })
})
