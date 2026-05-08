import { render, screen } from '@testing-library/react'
import LicenseeContactsCard from './LicenseeContactsCard'
import { getDashboardContacts } from '../../../services/dashboard'

vi.mock('../../../services/dashboard')

describe('<LicenseeContactsCard />', () => {
  it('shows loading state while the request is in flight', () => {
    getDashboardContacts.mockReturnValue(new Promise(() => {}))

    render(<LicenseeContactsCard />)

    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('shows an error message when the request fails', async () => {
    getDashboardContacts.mockRejectedValue(new Error('fail'))

    render(<LicenseeContactsCard />)

    expect(await screen.findByText('Erro ao carregar dados.')).toBeInTheDocument()
  })

  it('renders total and chatbot contact counts on success', async () => {
    getDashboardContacts.mockResolvedValue({
      data: { total: 500, in_chatbot: 120 },
    })

    render(<LicenseeContactsCard />)

    expect(await screen.findByText('500')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('Contatos')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('No Chatbot')).toBeInTheDocument()
  })
})
