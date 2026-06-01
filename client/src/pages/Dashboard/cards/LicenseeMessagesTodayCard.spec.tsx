import { render, screen } from '@testing-library/react'
import LicenseeMessagesTodayCard from './LicenseeMessagesTodayCard'
import { getDashboardMessagesToday } from '../../../services/dashboard'

vi.mock('../../../services/dashboard')

describe('<LicenseeMessagesTodayCard />', () => {
  it('shows loading state while the request is in flight', () => {
    getDashboardMessagesToday.mockReturnValue(new Promise(() => {}))

    render(<LicenseeMessagesTodayCard />)

    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('shows an error message when the request fails', async () => {
    getDashboardMessagesToday.mockRejectedValue(new Error('fail'))

    render(<LicenseeMessagesTodayCard />)

    expect(await screen.findByText('Erro ao carregar dados.')).toBeInTheDocument()
  })

  it('renders sent and failed message counts with percentages on success', async () => {
    getDashboardMessagesToday.mockResolvedValue({
      data: { sent_today: 300, sent_pct: 97, failed_today: 9, failed_pct: 3 },
    })

    render(<LicenseeMessagesTodayCard />)

    expect(await screen.findByText('300')).toBeInTheDocument()
    expect(screen.getByText('Enviadas (97%)')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
    expect(screen.getByText('Falhas (3%)')).toBeInTheDocument()
    expect(screen.getByText('Mensagens Hoje')).toBeInTheDocument()
  })
})
