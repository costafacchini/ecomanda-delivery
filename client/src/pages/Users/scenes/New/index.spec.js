import UserNew from '.'
import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { createUser } from '../../../../services/user'

jest.mock('../../../../services/user')

describe('<UserNew />', () => {
  let loggedUser = {
    isSuper: false,
    licensee: 'id'
  }

  function mount() {
    render(
      <MemoryRouter>
        <UserNew loggedUser={loggedUser} />
      </MemoryRouter>)
  }

  it('creates a new user when the backend returns success', async () => {
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

    cleanup()

    loggedUser = {
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
