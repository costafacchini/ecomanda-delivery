import { render, screen, fireEvent } from '@testing-library/react'
import SuperDeliveryRateCard from './SuperDeliveryRateCard'
import { getDashboardDeliveryRate } from '../../../services/dashboard'
import { getMessages } from '../../../services/message'

vi.mock('../../../services/dashboard')
vi.mock('../../../services/message')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, opts?: Record<string, unknown>) => {
      if (opts && typeof opts.pct !== 'undefined') return `${k}:${opts.pct}`
      if (opts && typeof opts.count !== 'undefined') return `${k}:${opts.count}`
      return k
    },
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

describe('<SuperDeliveryRateCard />', () => {
  it('shows loading state while the request is in flight', () => {
    getDashboardDeliveryRate.mockReturnValue(new Promise(() => {}))

    render(<SuperDeliveryRateCard />)

    expect(screen.getByText('common.loading')).toBeInTheDocument()
  })

  it('shows an error message when the request fails', async () => {
    getDashboardDeliveryRate.mockRejectedValue(new Error('fail'))

    render(<SuperDeliveryRateCard />)

    expect(await screen.findByText('dashboard.loadError')).toBeInTheDocument()
  })

  it('renders sent and failed counts with percentages on success', async () => {
    getDashboardDeliveryRate.mockResolvedValue({
      data: {
        sent_today: 950,
        sent_pct: 95,
        failed_today: 50,
        failed_pct: 5,
      },
    })

    render(<SuperDeliveryRateCard />)

    expect(await screen.findByText('950')).toBeInTheDocument()
    expect(screen.getByText('dashboard.deliveryRate.sentLabel:95')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('dashboard.deliveryRate.failedLabel:5')).toBeInTheDocument()
    expect(screen.getByText('dashboard.deliveryRate.cardTitle')).toBeInTheDocument()
  })

  it('opens FailedMessagesModal when the failed count is clicked', async () => {
    getDashboardDeliveryRate.mockResolvedValue({
      data: { sent_today: 900, sent_pct: 90, failed_today: 10, failed_pct: 10 },
    })
    getMessages.mockResolvedValue({ data: [] })

    render(<SuperDeliveryRateCard />)

    fireEvent.click(await screen.findByText('dashboard.deliveryRate.failedButton:10'))

    expect(await screen.findByText('dashboard.failedMessages.modalTitle')).toBeInTheDocument()
  })
})
