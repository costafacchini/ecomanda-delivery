import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createRoutesStub } from 'react-router'
import UserForm from './'

describe('<UserForm />', () => {
  const onSubmit = vi.fn()

  function mount(props = {}) {
    const Stub = createRoutesStub([
      {
        path: '/test',
        Component: () => <UserForm onSubmit={onSubmit} {...props} />,
      },
    ])
    render(<Stub initialEntries={['/test']} />)
  }

  it('is rendered with the default initial values', () => {
    mount()

    expect(screen.getByLabelText('Nome')).toHaveValue('')
    expect(screen.getByLabelText('Ativo')).toBeChecked()
    expect(screen.getByLabelText('E-email')).toHaveValue('')
    expect(screen.getByLabelText('Senha')).toHaveValue('')
  })

  it('can receive initial values', () => {
    const user = {
      name: 'Name',
      active: false,
      email: 'email@gmail.com',
      password: '12345',
      role: 'agent',
    }

    const currentUser = {
      role: 'super',
    }
    mount({ initialValues: user, currentUser: currentUser })

    expect(screen.getByLabelText('Nome')).toHaveValue('Name')
    expect(screen.getByLabelText('Ativo')).not.toBeChecked()
    expect(screen.getByLabelText('E-email')).toHaveValue('email@gmail.com')
    expect(screen.getByLabelText('Senha')).toHaveValue('12345')
    expect(screen.getByLabelText('Perfil')).toHaveValue('agent')
  })

  describe('role', () => {
    it('is not rendered when currentUser has no role or is agent', () => {
      mount()

      expect(screen.queryByLabelText('Perfil')).not.toBeInTheDocument()

      cleanup()

      mount({ currentUser: { role: 'agent' } })

      expect(screen.queryByLabelText('Perfil')).not.toBeInTheDocument()
    })

    it('is rendered when currentUser is admin', () => {
      mount({ currentUser: { role: 'admin' } })

      expect(screen.getByLabelText('Perfil')).toBeInTheDocument()
      expect(screen.queryByText('Super')).not.toBeInTheDocument()
    })

    it('shows super option when currentUser is super', () => {
      mount({ currentUser: { role: 'super' } })

      expect(screen.getByLabelText('Perfil')).toBeInTheDocument()
      expect(screen.getByText('Super')).toBeInTheDocument()
    })
  })

  describe('licensee', () => {
    it('is rendered when currentUser is super', () => {
      mount()

      expect(screen.queryByLabelText('Licenciado')).not.toBeInTheDocument()

      cleanup()

      mount({ currentUser: { role: 'super' } })

      expect(screen.getByText('Licenciado')).toBeInTheDocument()
    })
  })

  describe('submit', () => {
    it('is called when the user submits the form', async () => {
      mount()

      expect(onSubmit).not.toHaveBeenCalled()

      fireEvent.click(screen.getByText('Salvar'))

      await waitFor(() => expect(onSubmit).toHaveBeenCalled())

      expect(onSubmit).toHaveBeenCalledWith({
        name: '',
        active: true,
        email: '',
        role: 'agent',
        licensee: '',
        password: '',
      })
    })
  })
})
