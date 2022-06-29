import mountWithRedux, { createStore } from '../../../../.jest/redux-testing'
import UserEdit from './'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { getUser, updateUser } from '../../../../services/user'
import { MemoryRouter } from 'react-router';

jest.mock('../../../../services/user')

describe('<UserEdit />', () => {
  function mount() {
    const store = createStore()
    mountWithRedux(store)(
      <MemoryRouter>
        <UserEdit />
      </MemoryRouter>)
  }

  it('renders the form with the received user', async () => {
    getUser.mockResolvedValue({ status: 201, data: { id: '1', name: 'Usuario' } })

    mount()

    await screen.findByDisplayValue('Usuario')
  })

  it('edits the user', async () => {
    getUser.mockResolvedValue({ status: 201, data: { id: '1', name: 'Usuario' } })

    mount()

    await screen.findByDisplayValue('Usuario')

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'New Name' } })

    updateUser.mockResolvedValue({ status: 200, data: { id: '1', name: 'New Name' } })

    fireEvent.click(screen.getByRole('button', { name: "Salvar" }))

    await waitFor(() => expect(updateUser).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Name' })))
  })
})
