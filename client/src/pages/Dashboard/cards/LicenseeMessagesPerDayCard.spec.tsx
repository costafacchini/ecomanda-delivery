import { render, screen } from '@testing-library/react'
import LicenseeMessagesPerDayCard from './LicenseeMessagesPerDayCard'
import { getDashboardMessagesPerDay } from '../../../services/dashboard'

vi.mock('../../../services/dashboard')

describe('<LicenseeMessagesPerDayCard />', () => {
  it('shows loading state while the request is in flight', () => {
    getDashboardMessagesPerDay.mockReturnValue(new Promise(() => {}))

    render(<LicenseeMessagesPerDayCard />)

    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('shows an error message when the request fails', async () => {
    getDashboardMessagesPerDay.mockRejectedValue(new Error('fail'))

    render(<LicenseeMessagesPerDayCard />)

    expect(await screen.findByText('Erro ao carregar dados.')).toBeInTheDocument()
  })

  it('renders a row per day with date and count on success', async () => {
    getDashboardMessagesPerDay.mockResolvedValue({
      data: {
        per_day: [
          { date: '2026-05-05', count: 110 },
          { date: '2026-05-06', count: 95 },
        ],
      },
    })

    render(<LicenseeMessagesPerDayCard />)

    expect(await screen.findByText('2026-05-05')).toBeInTheDocument()
    expect(screen.getByText('110')).toBeInTheDocument()
    expect(screen.getByText('2026-05-06')).toBeInTheDocument()
    expect(screen.getByText('95')).toBeInTheDocument()
    expect(screen.getByText('Mensagens por Dia')).toBeInTheDocument()
  })

  it('renders an empty table when per_day is absent', async () => {
    getDashboardMessagesPerDay.mockResolvedValue({ data: {} })

    render(<LicenseeMessagesPerDayCard />)

    await screen.findByText('Mensagens por Dia')

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.queryByRole('cell')).not.toBeInTheDocument()
  })
})
