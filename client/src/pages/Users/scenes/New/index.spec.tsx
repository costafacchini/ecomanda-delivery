import UserNew from '.'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createRoutesStub } from 'react-router'
import { createUser } from '../../../../services/user'

vi.mock('../../../../services/user')

describe('<UserNew />', () => {
  function mount(currentUser: any) {
    const Stub = createRoutesStub([
      {
        path: '/users/new',
        Component: () => <UserNew currentUser={currentUser} />,
      },
      {
        path: '/users',
        Component: () => <div>Users Index</div>,
      },
    ])
    render(<Stub initialEntries={['/users/new']} />)
  }

  async function selectRole(role: string) {
    fireEvent.change(screen.getByLabelText('Perfil'), { target: { value: role } })
    await waitFor(() => expect(screen.getByLabelText('Perfil')).toHaveValue(role))
  }

  it('auto-assigns the admin licensee when creating an agent', async () => {
    mount({ role: 'admin', licensee: 'licensee-id' })

    createUser.mockResolvedValue({ status: 201 })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(createUser).toHaveBeenCalledWith({
      name: '',
      email: '',
      password: '',
      active: true,
      role: 'agent',
      licensee: 'licensee-id',
    }))
  })

  it('strips licensee when creating an admin user', async () => {
    mount({ role: 'super' })
    await selectRole('admin')

    createUser.mockResolvedValue({ status: 201 })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(createUser).toHaveBeenCalledWith({
      name: '',
      email: '',
      password: '',
      active: true,
      role: 'admin',
    }))
  })

  it('navigates to /users after successful creation', async () => {
    mount({ role: 'super' })
    await selectRole('admin')

    createUser.mockResolvedValue({ status: 201 })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(screen.getByText('Users Index')).toBeInTheDocument())
  })

  it('renders the errors when the backend returns error', async () => {
    mount({ role: 'super' })
    await selectRole('admin')

    createUser.mockResolvedValue({ status: 422, data: { errors: [{ message: 'This is an error' }] } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(screen.getByText('This is an error')).toBeInTheDocument()
    })
  })
})
