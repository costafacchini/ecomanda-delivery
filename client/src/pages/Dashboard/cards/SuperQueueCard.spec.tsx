import { render, screen } from '@testing-library/react'
import SuperQueueCard from './SuperQueueCard'
import { getDashboardQueue } from '../../../services/dashboard'

vi.mock('../../../services/dashboard')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

describe('<SuperQueueCard />', () => {
  it('shows loading state while the request is in flight', () => {
    getDashboardQueue.mockReturnValue(new Promise(() => {}))

    render(<SuperQueueCard />)

    expect(screen.getByText('common.loading')).toBeInTheDocument()
  })

  it('shows an error message when the request fails', async () => {
    getDashboardQueue.mockRejectedValue(new Error('fail'))

    render(<SuperQueueCard />)

    expect(await screen.findByText('dashboard.loadError')).toBeInTheDocument()
  })

  it('renders pending messages and average queue time on success', async () => {
    getDashboardQueue.mockResolvedValue({
      data: { pending_messages: 14, avg_time_in_queue_seconds: 3 },
    })

    render(<SuperQueueCard />)

    expect(await screen.findByText('14')).toBeInTheDocument()
    expect(screen.getByText('3s')).toBeInTheDocument()
    expect(screen.getByText('dashboard.queue.cardTitle')).toBeInTheDocument()
    expect(screen.getByText('dashboard.queue.pendingLabel')).toBeInTheDocument()
    expect(screen.getByText('dashboard.queue.avgTimeLabel')).toBeInTheDocument()
  })
})
