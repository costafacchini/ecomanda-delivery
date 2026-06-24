import UsersIndex from './'
import { fireEvent, screen, waitFor, render } from '@testing-library/react'
import { getUsers } from '../../../../services/user'
import { getLicensees } from '../../../../services/licensee'
import { createRoutesStub } from 'react-router'
import { userFactory } from '../../../../factories/user'
import { SimpleCrudContextProvider } from '../../../../contexts/SimpleCrud'

vi.mock('../../../../services/user')
vi.mock('../../../../services/licensee')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

describe('<UsersIndex />', () => {
  const currentUser = { role: 'super' }

  function mount({ currentUser }) {
    const Stub = createRoutesStub([
      {
        path: '/users',
        Component: () => <UsersIndex currentUser={currentUser} />,
      },
    ])
    render(
      <SimpleCrudContextProvider>
        <Stub initialEntries={['/users']} />
      </SimpleCrudContextProvider>
    )
  }

  it('filters for all users on it is opened and there is no previous applied filters', async () => {
    getUsers.mockResolvedValue({ status: 201, data: [{ id: '1', name: 'Rosa' }] })

    mount({ currentUser })

    await waitFor(() => expect(getUsers).toHaveBeenCalled())

    expect(getUsers).toHaveBeenCalledWith({ page: 1 })

    expect(await screen.findByText('Rosa')).toBeInTheDocument()
  })

  it('paginates the users', async () => {
    getUsers.mockResolvedValue({ status: 201, data: userFactory.buildList(30) })

    mount({ currentUser })

    getUsers.mockResolvedValue({ status: 201, data: [userFactory.build({ name: 'User from new page' })] })

    fireEvent.click(await screen.findByText('common.loadMore'))

    expect(await screen.findByText('User from new page')).toBeInTheDocument()

    expect(getUsers).toHaveBeenCalledWith({ page: 2 })
  })

  it('filters the users by expression', async () => {
    getUsers.mockResolvedValue({ status: 201, data: [userFactory.build({ name: 'User' })] })

    mount({ currentUser })

    await screen.findByText('User')

    getUsers.mockResolvedValue({ status: 201, data: [userFactory.build({ name: 'A user filtered by expression' })] })

    fireEvent.change(screen.getByPlaceholderText('users.expressionPlaceholder'), { target: { value: 'expression' } })

    fireEvent.click(screen.getByTitle('users.filterButtonTitle'))

    expect(await screen.findByText('A user filtered by expression')).toBeInTheDocument()

    expect(getUsers).toHaveBeenNthCalledWith(2, { page: 1, expression: 'expression' })
  })

  describe('licensee select filter', () => {
    it('does not show the licensee if logged user is not super', async () => {
      getUsers.mockResolvedValue({ status: 201, data: [userFactory.build({ name: 'User' })] })

      const currentUser = { role: 'agent' }

      mount({ currentUser })

      await screen.findByText('users.title')

      await screen.findByText('User')

      expect(screen.queryByLabelText('users.licenseeFilter')).not.toBeInTheDocument()
    })

    it('changes the filters to get the users', async () => {
      getLicensees.mockResolvedValueOnce({ status: 201, data: [{ _id: '12345678', name: 'Rosa' }] })

      getUsers.mockResolvedValueOnce({ status: 201, data: [userFactory.build({ name: 'User' })] })
      getUsers.mockResolvedValueOnce({ status: 201, data: [userFactory.build({ name: 'Another' })] })

      mount({ currentUser })

      await screen.findByText('users.title')

      await screen.findByText('users.licenseeFilter')

      fireEvent.change(screen.getByLabelText('users.licenseeFilter'), { target: { value: 'ros' } })

      fireEvent.click(await screen.findByText('Rosa'))

      await screen.findByText('Another')

      expect(getUsers).toHaveBeenCalledWith(expect.objectContaining({ licensee: '12345678' }))
    })
  })
})
