import UserEdit from './'
import { fireEvent, screen, waitFor, render } from '@testing-library/react'
import { getUser, updateUser } from '../../../../services/user'
import { createRoutesStub } from 'react-router';

vi.mock('../../../../services/user')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, opts?: Record<string, unknown>) => {
      if (opts && k === 'users.editingUser') return `Editing: ${opts.name}`
      return k
    },
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

describe('<UserEdit />', () => {
  function mount() {
    const Stub = createRoutesStub([
      {
        path: '/users/:id',
        Component: UserEdit,
      },
      {
        path: '/users',
        Component: () => <div>Users Index</div>,
      },
    ])
    render(<Stub initialEntries={['/users/1']} />)
  }

  it('renders the form with the received user', async () => {
    getUser.mockResolvedValue({ status: 201, data: { id: '1', name: 'Usuario' } })

    mount()

    await screen.findByDisplayValue('Usuario')
  })

  it('edits the user', async () => {
    getUser.mockResolvedValue({ status: 201, data: { id: '1', name: 'Usuario', role: 'admin', email: 'usuario@test.com' } })

    mount()

    await screen.findByDisplayValue('Usuario')

    fireEvent.change(screen.getByLabelText(/^common.name/), { target: { value: 'New Name' } })

    updateUser.mockResolvedValue({ status: 200, data: { id: '1', name: 'New Name' } })

    fireEvent.click(screen.getByRole('button', { name: 'common.save' }))

    await waitFor(() => expect(updateUser).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Name' })))
  })
})
