import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createRoutesStub } from 'react-router'
import UserForm from './'

describe('<UserForm />', () => {
  const onSubmit = jest.fn()

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
      isAdmin: false,
      isSuper: false,
    }

    const currentUser = {
      isAdmin: true,
      isSuper: true,
    }
    mount({ initialValues: user, currentUser: currentUser })

    expect(screen.getByLabelText('Nome')).toHaveValue('Name')
    expect(screen.getByLabelText('Ativo')).not.toBeChecked()
    expect(screen.getByLabelText('E-email')).toHaveValue('email@gmail.com')
    expect(screen.getByLabelText('Senha')).toHaveValue('12345')
    expect(screen.getByLabelText('Tem diretos de administrador?')).not.toBeChecked()
    expect(screen.getByLabelText('Tem diretos de super usuário?')).not.toBeChecked()
  })

  describe('isAdmin', () => {
    it('is rendered when currentUser isAdmin', () => {
      mount()

      expect(screen.queryByLabelText('Tem diretos de administrador?')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Tem diretos de super usuário?')).not.toBeInTheDocument()

      cleanup()

      const currentUser = {
        isAdmin: true,
      }
      mount({ currentUser: currentUser })

      expect(screen.getByLabelText('Tem diretos de administrador?')).toBeInTheDocument()
      expect(screen.queryByLabelText('Tem diretos de super usuário?')).not.toBeInTheDocument()
    })
  })

  describe('isSuper', () => {
    it('is rendered when currentUser isSuper', () => {
      mount()

      expect(screen.queryByLabelText('Tem diretos de administrador?')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Tem diretos de super usuário?')).not.toBeInTheDocument()

      cleanup()

      const currentUser = {
        isSuper: true,
      }
      mount({ currentUser: currentUser })

      expect(screen.getByLabelText('Tem diretos de administrador?')).toBeInTheDocument()
      expect(screen.getByLabelText('Tem diretos de super usuário?')).toBeInTheDocument()
    })
  })

  describe('licensee', () => {
    it('is rendered when currentUser isSuper', () => {
      mount()

      expect(screen.queryByLabelText('Licenciado')).not.toBeInTheDocument()

      cleanup()

      const currentUser = {
        isSuper: true,
      }
      mount({ currentUser: currentUser })

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
        isAdmin: false,
        isSuper: false,
        licensee: '',
        password: '',
      })
    })
  })
})
