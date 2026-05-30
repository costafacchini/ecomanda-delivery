import { render, screen, fireEvent } from '@testing-library/react'
import SuperDeliveryRateCard from './SuperDeliveryRateCard'
import { getDashboardDeliveryRate } from '../../../services/dashboard'
import { getMessages } from '../../../services/message'

vi.mock('../../../services/dashboard')
vi.mock('../../../services/message')

describe('<SuperDeliveryRateCard />', () => {
  it('shows loading state while the request is in flight', () => {
    getDashboardDeliveryRate.mockReturnValue(new Promise(() => {}))

    render(<SuperDeliveryRateCard />)

    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('shows an error message when the request fails', async () => {
    getDashboardDeliveryRate.mockRejectedValue(new Error('fail'))

    render(<SuperDeliveryRateCard />)

    expect(await screen.findByText('Erro ao carregar dados.')).toBeInTheDocument()
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
    expect(screen.getByText('Enviadas (95%)')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('Falhas (5%)')).toBeInTheDocument()
    expect(screen.getByText('Taxa de Entrega')).toBeInTheDocument()
  })

  it('opens FailedMessagesModal when the failed count is clicked', async () => {
    getDashboardDeliveryRate.mockResolvedValue({
      data: { sent_today: 900, sent_pct: 90, failed_today: 10, failed_pct: 10 },
    })
    getMessages.mockResolvedValue({ data: [] })

    render(<SuperDeliveryRateCard />)

    fireEvent.click(await screen.findByText('10'))

    expect(await screen.findByText('Mensagens com Falha')).toBeInTheDocument()
  })
})
