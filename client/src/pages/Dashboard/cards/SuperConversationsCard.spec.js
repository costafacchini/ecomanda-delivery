import { render, screen } from '@testing-library/react'
import SuperConversationsCard from './SuperConversationsCard'
import { getDashboardConversations } from '../../../services/dashboard'

vi.mock('../../../services/dashboard')

describe('<SuperConversationsCard />', () => {
  it('shows loading state while the request is in flight', () => {
    getDashboardConversations.mockReturnValue(new Promise(() => {}))

    render(<SuperConversationsCard />)

    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('shows an error message when the request fails', async () => {
    getDashboardConversations.mockRejectedValue(new Error('fail'))

    render(<SuperConversationsCard />)

    expect(await screen.findByText('Erro ao carregar dados.')).toBeInTheDocument()
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
    expect(screen.getByText('120s')).toBeInTheDocument()
    expect(screen.getByText('Conversas')).toBeInTheDocument()
    expect(screen.getByText('Iniciadas hoje')).toBeInTheDocument()
    expect(screen.getByText('Encerradas hoje')).toBeInTheDocument()
    expect(screen.getByText('Média msg/conversa')).toBeInTheDocument()
    expect(screen.getByText('Duração média')).toBeInTheDocument()
  })
})
