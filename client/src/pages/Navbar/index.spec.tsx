import { render, screen } from '@testing-library/react'
import Navbar from './index'
import { AppContext } from '../../contexts/App'

const appContextValue = { updateActiveLicensee: vi.fn() }

function renderWithContext(ui: React.ReactElement) {
  return render(
    <AppContext.Provider value={appContextValue}>
      {ui}
    </AppContext.Provider>
  )
}

describe('<Navbar>', () => {
  it('renders the navbar options', () => {
    renderWithContext(<Navbar />)

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/Contatos/i)).toBeInTheDocument()
    expect(screen.getByText(/Gatilhos/i)).toBeInTheDocument()
    expect(screen.getByText(/Mensagens/i)).toBeInTheDocument()
    expect(screen.getByText(/Templates/i)).toBeInTheDocument()
    expect(screen.queryByText(/Licenciados/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Usuários/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Relatórios/i)).not.toBeInTheDocument()
  })

  it('renders the navbar options for admins', () => {
    renderWithContext(<Navbar currentUser={{ role: 'admin' }} />)

    expect(screen.getByText(/Licenciados/i)).toBeInTheDocument()
    expect(screen.getByText(/Usuários/i)).toBeInTheDocument()
    expect(screen.queryByText(/Relatórios/i)).not.toBeInTheDocument()
  })

  it('renders the navbar options for super users', () => {
    renderWithContext(<Navbar currentUser={{ role: 'super' }} />)
    expect(screen.getByText(/Relatórios/i)).toBeInTheDocument()
  })

  describe('Setores nav item', () => {
    it('is hidden when useSetores is false', () => {
      renderWithContext(<Navbar currentUser={{ role: 'admin', licensee: { useSetores: false } }} />)
      expect(screen.queryByText(/Setores/i)).not.toBeInTheDocument()
    })

    it('is hidden when role is agent', () => {
      renderWithContext(<Navbar currentUser={{ role: 'agent', licensee: { useSetores: true } }} />)
      expect(screen.queryByText(/Setores/i)).not.toBeInTheDocument()
    })

    it('is visible for admin with useSetores enabled', () => {
      renderWithContext(<Navbar currentUser={{ role: 'admin', licensee: { useSetores: true } }} />)
      expect(screen.getByText(/Setores/i)).toBeInTheDocument()
    })

    it('is visible for supervisor with useSetores enabled', () => {
      renderWithContext(<Navbar currentUser={{ role: 'supervisor', licensee: { useSetores: true } }} />)
      expect(screen.getByText(/Setores/i)).toBeInTheDocument()
    })
  })
})
