import UserNew from '.'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createRoutesStub } from 'react-router'
import { createUser } from '../../../../services/user'

jest.mock('../../../../services/user')

describe('<UserNew />', () => {
  let currentUser = {
    isSuper: false,
    licensee: 'id'
  }

  function mount() {
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

  it('creates a new user when the backend returns success and user is not super', async () => {
    mount()

    createUser.mockResolvedValue({ status: 201 })

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(createUser).toHaveBeenCalledWith({
      name: '',
      email: '',
      password: '',
      active: true,
      isAdmin: false,
      isSuper: false,
      licensee: 'id'
    }))
  })

  it('creates a new user when the backend returns success and user is super', async () => {
    currentUser = {
      isSuper: true,
    }
    mount()

    createUser.mockResolvedValue({ status: 201 })

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(createUser).toHaveBeenCalledWith({
      name: '',
      email: '',
      password: '',
      active: true,
      isAdmin: false,
      isSuper: false,
      licensee: ''
    }))
  })

  it('renders the errors when the backend returns error', async () => {
    mount()

    createUser.mockResolvedValue({ status: 422, data: { errors: [{ message: 'This is an error' }] } })

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(screen.getByText('This is an error')).toBeInTheDocument()
    })
  })
})
