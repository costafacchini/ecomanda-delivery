import SetorEdit from './'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { getSetor, updateSetor } from '../../../../services/setor'
import { getUsers } from '../../../../services/user'
import { createRoutesStub } from 'react-router'

vi.mock('../../../../services/setor')
vi.mock('../../../../services/user')

describe('<SetorEdit />', () => {
  const currentUser = {
    role: 'admin',
    licensee: { _id: 'lic-1' },
  }

  function mount() {
    ;(getUsers as any).mockResolvedValue({ data: [] })

    const Stub = createRoutesStub([
      {
        path: '/setores/:id/edit',
        Component: () => <SetorEdit currentUser={currentUser} />,
      },
      {
        path: '/setores',
        Component: () => <div>Setores Index</div>,
      },
    ])
    render(<Stub initialEntries={['/setores/1/edit']} />)
  }

  it('renders the form with the received setor', async () => {
    ;(getSetor as any).mockResolvedValue({
      status: 200,
      data: { id: '1', name: 'Suporte', active: true, users: [] },
    })

    mount()

    await screen.findByDisplayValue('Suporte')
  })

  it('updates the setor on submit', async () => {
    ;(getSetor as any).mockResolvedValue({
      status: 200,
      data: { id: '1', name: 'Suporte', active: true, users: [] },
    })

    mount()

    await screen.findByDisplayValue('Suporte')

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'TI' } })

    ;(updateSetor as any).mockResolvedValue({ status: 200 })

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() =>
      expect(updateSetor).toHaveBeenCalledWith(expect.objectContaining({ name: 'TI' }))
    )
  })
})
