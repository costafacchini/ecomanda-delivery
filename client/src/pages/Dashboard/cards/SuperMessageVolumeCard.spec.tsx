import { render, screen } from '@testing-library/react'
import SuperMessageVolumeCard from './SuperMessageVolumeCard'
import { getDashboardMessageVolume } from '../../../services/dashboard'

vi.mock('../../../services/dashboard')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

describe('<SuperMessageVolumeCard />', () => {
  it('shows loading state while the request is in flight', () => {
    getDashboardMessageVolume.mockReturnValue(new Promise(() => {}))

    render(<SuperMessageVolumeCard />)

    expect(screen.getByText('common.loading')).toBeInTheDocument()
  })

  it('shows an error message when the request fails', async () => {
    getDashboardMessageVolume.mockRejectedValue(new Error('fail'))

    render(<SuperMessageVolumeCard />)

    expect(await screen.findByText('dashboard.loadError')).toBeInTheDocument()
  })

  it('renders throughput metrics and per-day/per-hour rows on success', async () => {
    getDashboardMessageVolume.mockResolvedValue({
      data: {
        peak_throughput: 120,
        avg_transfer_rate: 45,
        per_day: [
          { _id: '2026-05-01', count: 200 },
          { _id: '2026-05-02', count: 180 },
        ],
        per_hour: [
          { _id: '2026-05-01T09', count: 30 },
          { _id: '2026-05-01T10', count: 50 },
        ],
      },
    })

    render(<SuperMessageVolumeCard />)

    expect(await screen.findByText('120')).toBeInTheDocument()
    expect(screen.getByText('45')).toBeInTheDocument()
    expect(screen.getByText('2026-05-01')).toBeInTheDocument()
    expect(screen.getByText('2026-05-02')).toBeInTheDocument()
    expect(screen.getByText('09h')).toBeInTheDocument()
    expect(screen.getByText('10h')).toBeInTheDocument()
    expect(screen.getByText('dashboard.messageVolume.cardTitle')).toBeInTheDocument()
  })

  it('renders empty tables when per_day and per_hour are absent', async () => {
    getDashboardMessageVolume.mockResolvedValue({
      data: { peak_throughput: 0, avg_transfer_rate: 0 },
    })

    render(<SuperMessageVolumeCard />)

    await screen.findByText('dashboard.messageVolume.cardTitle')

    expect(screen.getByText('dashboard.messageVolume.perDayTitle')).toBeInTheDocument()
    expect(screen.getByText('dashboard.messageVolume.perHourTitle')).toBeInTheDocument()
  })
})
