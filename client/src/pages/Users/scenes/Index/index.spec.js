import mountWithRedux, { createStore } from '../../../../.jest/redux-testing'
import UsersIndex from './'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { getUsers } from '../../../../services/user'
import { getLicensees } from '../../../../services/licensee'
import { MemoryRouter } from 'react-router'
import { userFactory } from '../../../../factories/user'

jest.mock('../../../../services/user')
jest.mock('../../../../services/licensee')

describe('<UsersIndex />', () => {
  function mount() {
    const loggedUser = {
      isSuper: true
    }

    const store = createStore()
    mountWithRedux(store)(
      <MemoryRouter>
        <UsersIndex loggedUser={loggedUser} />
      </MemoryRouter>)

    return store
  }

  it('filters for all users on it is opened and there is no previous applied filters', async () => {
    getUsers.mockResolvedValue({ status: 201, data: [{ id: '1', name: 'Rosa' }] })

    mount()

    await waitFor(() => expect(getUsers).toHaveBeenCalled())

    expect(getUsers).toHaveBeenCalledWith({
      page: 1,
      expression: '',
      licensee: '',
    })

    expect(await screen.findByText('Rosa')).toBeInTheDocument()
  })

  it('paginates the users', async () => {
    getUsers.mockResolvedValue({ status: 201, data: userFactory.buildList(30) })

    mount()

    getUsers.mockResolvedValue({ status: 201, data: [userFactory.build({ name: 'User from new page' })] })

    fireEvent.click(await screen.findByText('Carregar mais'))

    expect(await screen.findByText('User from new page')).toBeInTheDocument()

    expect(getUsers).toHaveBeenCalledWith({
      page: 2,
      expression: '',
      licensee: '',
    })
  })

  it('filters the users by expression', async () => {
    getUsers.mockResolvedValue({ status: 201, data: [userFactory.build({ name: 'User' })] })

    mount()

    await screen.findByText('User')

    getUsers.mockResolvedValue({ status: 201, data: [userFactory.build({ name: 'A user filtered by expression' })] })

    fireEvent.change(screen.getByPlaceholderText('Digite a expressão'), { target: { value: 'expression' } })

    fireEvent.click(screen.getByTitle('Filtre pelo usuário'))

    expect(await screen.findByText('A user filtered by expression')).toBeInTheDocument()

    expect(getUsers).toHaveBeenNthCalledWith(2, {
      page: 1,
      expression: 'expression',
      licensee: '',
    })
  })

  describe('licensee select filter', () => {
    it('does not show the licensee if logged user is not super', async () => {
      const loggedUser = {
        isSuper: false
      }

      const store = createStore()
      mountWithRedux(store)(
        <MemoryRouter>
          <UsersIndex loggedUser={loggedUser} />
        </MemoryRouter>)

      await screen.findByText('Usuários')

      expect(screen.queryByLabelText('Licenciado')).not.toBeInTheDocument()
    })

    it('changes the filters to get the users', async () => {
      getLicensees.mockResolvedValueOnce({ status: 201, data: [{ _id: '12345678', name: 'Rosa' }] })

      getUsers.mockResolvedValue({ status: 201, data: [userFactory.build({ name: 'User' })] })

      mount()

      await screen.findByText('Usuários')

      fireEvent.change(screen.getByLabelText('Licenciado'), { target: { value: 'ros' } })

      fireEvent.click(await screen.findByText('Rosa'))

      await screen.findByText('User')

      expect(getUsers).toHaveBeenCalledWith(expect.objectContaining({ licensee: '12345678' }))
    })
  })
})
