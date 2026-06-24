import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createRoutesStub } from 'react-router'
import UserForm from './'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

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

    expect(screen.getByLabelText(/^common.name/)).toHaveValue('')
    expect(screen.getByLabelText('common.active')).toBeChecked()
    expect(screen.getByLabelText(/^common.email/)).toHaveValue('')
    expect(screen.getByLabelText(/^users.passwordLabel/)).toHaveValue('')
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

    expect(screen.getByLabelText(/^common.name/)).toHaveValue('Name')
    expect(screen.getByLabelText('common.active')).not.toBeChecked()
    expect(screen.getByLabelText(/^common.email/)).toHaveValue('email@gmail.com')
    expect(screen.getByLabelText(/^users.passwordLabel/)).toHaveValue('12345')
    expect(screen.getByLabelText('users.columnProfile')).toHaveValue('agent')
  })

  describe('role', () => {
    it('is not rendered when currentUser has no role or is agent', () => {
      mount()

      expect(screen.queryByLabelText('users.columnProfile')).not.toBeInTheDocument()

      cleanup()

      mount({ currentUser: { role: 'agent' } })

      expect(screen.queryByLabelText('users.columnProfile')).not.toBeInTheDocument()
    })

    it('is rendered when currentUser is admin', () => {
      mount({ currentUser: { role: 'admin' } })

      expect(screen.getByLabelText('users.columnProfile')).toBeInTheDocument()
      expect(screen.queryByText('users.roles.super')).not.toBeInTheDocument()
    })

    it('shows super option when currentUser is super', () => {
      mount({ currentUser: { role: 'super' } })

      expect(screen.getByLabelText('users.columnProfile')).toBeInTheDocument()
      expect(screen.getByText('users.roles.super')).toBeInTheDocument()
    })
  })

  describe('licensee', () => {
    it('is only visible to super users for agent and supervisor roles', () => {
      mount({ currentUser: { role: 'admin' }, initialValues: { role: 'agent' } })
      expect(screen.queryByText(/users.licenseeFilter/)).not.toBeInTheDocument()

      cleanup()

      mount({ currentUser: { role: 'super' }, initialValues: { role: 'agent' } })
      expect(screen.getByText(/users.licenseeFilter/)).toBeInTheDocument()

      cleanup()

      mount({ currentUser: { role: 'super' }, initialValues: { role: 'supervisor' } })
      expect(screen.getByText(/users.licenseeFilter/)).toBeInTheDocument()
    })

    it('is hidden for super users when role is admin or super', () => {
      mount({ currentUser: { role: 'super' }, initialValues: { role: 'admin' } })
      expect(screen.queryByText(/users.licenseeFilter/)).not.toBeInTheDocument()

      cleanup()

      mount({ currentUser: { role: 'super' }, initialValues: { role: 'super' } })
      expect(screen.queryByText(/users.licenseeFilter/)).not.toBeInTheDocument()
    })

    it('hides when super user changes selected role to admin', async () => {
      mount({ currentUser: { role: 'super' }, initialValues: { role: 'agent' } })

      expect(screen.getByText(/users.licenseeFilter/)).toBeInTheDocument()

      fireEvent.change(screen.getByLabelText('users.columnProfile'), { target: { value: 'admin' } })

      await waitFor(() => expect(screen.queryByText(/users.licenseeFilter/)).not.toBeInTheDocument())
    })

    it('does not submit when licensee is empty and currentUser is super with agent role', async () => {
      mount({ currentUser: { role: 'super' }, initialValues: { role: 'agent' } })

      fireEvent.click(screen.getByText('common.save'))

      await waitFor(() => expect(screen.getByText('users.validation.licenseeRequired')).toBeInTheDocument())

      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  describe('submit', () => {
    it('is called when the user submits the form', async () => {
      mount({ initialValues: { role: 'admin' } })

      expect(onSubmit).not.toHaveBeenCalled()

      fireEvent.change(screen.getByLabelText(/^common.name/), { target: { value: 'Test User' } })
      fireEvent.change(screen.getByLabelText(/^common.email/), { target: { value: 'test@test.com' } })

      fireEvent.click(screen.getByText('common.save'))

      await waitFor(() => expect(onSubmit).toHaveBeenCalled())

      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Test User',
        active: true,
        email: 'test@test.com',
        role: 'admin',
        licensee: '',
        password: '',
      })
    })
  })
})
