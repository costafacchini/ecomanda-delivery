import { render, screen } from '@testing-library/react'
import Navbar from './index'

describe('<Navbar>', () => {
  it('renders the navbar options', () => {
    render(<Navbar />)

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/Contatos/i)).toBeInTheDocument()
    expect(screen.getByText(/Gatilhos/i)).toBeInTheDocument()
    expect(screen.getByText(/Mensagens/i)).toBeInTheDocument()
  })

  it('renders the navbar options for admins', () => {
    render(<Navbar loggedUser={{ isAdmin: true }} />)

    expect(screen.getByText(/Licenciados/i)).toBeInTheDocument()
    expect(screen.getByText(/Relatórios/i)).toBeInTheDocument()
  })
})
