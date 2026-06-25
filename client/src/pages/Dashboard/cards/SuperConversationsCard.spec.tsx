import { render, screen } from '@testing-library/react'
import SuperConversationsCard from './SuperConversationsCard'
import { getDashboardConversations } from '../../../services/dashboard'

vi.mock('../../../services/dashboard')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

describe('<SuperConversationsCard />', () => {
  it('shows loading state while the request is in flight', () => {
    getDashboardConversations.mockReturnValue(new Promise(() => {}))

    render(<SuperConversationsCard />)

    expect(screen.getByText('common.loading')).toBeInTheDocument()
  })

  it('shows an error message when the request fails', async () => {
    getDashboardConversations.mockRejectedValue(new Error('fail'))

    render(<SuperConversationsCard />)

    expect(await screen.findByText('dashboard.loadError')).toBeInTheDocument()
  })

  it('renders conversation metrics on success', async () => {
    getDashboardConversations.mockResolvedValue({
      data: {
        started_today: 80,
        ended_today: 60,
        avg_messages_per_conversation: 5,
        avg_duration_seconds: 120,
      },
    })

    render(<SuperConversationsCard />)

    expect(await screen.findByText('80')).toBeInTheDocument()
    expect(screen.getByText('60')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('2m')).toBeInTheDocument()
    expect(screen.getByText('dashboard.conversations.cardTitle')).toBeInTheDocument()
    expect(screen.getByText('dashboard.conversations.startedLabel')).toBeInTheDocument()
    expect(screen.getByText('dashboard.conversations.endedLabel')).toBeInTheDocument()
    expect(screen.getByText('dashboard.conversations.avgMsgLabel')).toBeInTheDocument()
    expect(screen.getByText('dashboard.conversations.avgDurationLabel')).toBeInTheDocument()
  })
})
