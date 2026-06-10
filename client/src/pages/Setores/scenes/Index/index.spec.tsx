import SetoresIndex from './'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { getSetores, deleteSetor } from '../../../../services/setor'
import { createRoutesStub } from 'react-router'
import { setorFactory } from '../../../../factories/setor'

vi.mock('../../../../services/setor')

describe('<SetoresIndex />', () => {
  const currentUser = {
    role: 'admin',
    licensee: { _id: 'lic-1', name: 'Acme', useSetores: true },
  }

  function mount(user = currentUser) {
    const Stub = createRoutesStub([
      {
        path: '/setores',
        Component: () => <SetoresIndex currentUser={user} />,
      },
    ])
    render(<Stub initialEntries={['/setores']} />)
  }

  it('renders sector list', async () => {
    ;(getSetores as any).mockResolvedValue({
      status: 200,
      data: [
        setorFactory.build({ id: '1', name: 'Suporte', active: true }),
        setorFactory.build({ id: '2', name: 'Vendas', active: false }),
      ],
    })

    mount()

    expect(await screen.findByText('Suporte')).toBeInTheDocument()
    expect(await screen.findByText('Vendas')).toBeInTheDocument()
  })

  it('calls getSetores with the current licensee id', async () => {
    ;(getSetores as any).mockResolvedValue({ status: 200, data: [] })

    mount()

    await waitFor(() => expect(getSetores).toHaveBeenCalledWith({ licensee: 'lic-1' }))
  })

  it('deletes a sector when confirmed', async () => {
    ;(getSetores as any).mockResolvedValue({
      status: 200,
      data: [setorFactory.build({ id: '10', name: 'TI' })],
    })
    ;(deleteSetor as any).mockResolvedValue({ status: 200 })

    vi.spyOn(window, 'confirm').mockReturnValue(true)

    mount()

    await screen.findByText('TI')

    fireEvent.click(screen.getByTitle('Excluir setor'))

    await waitFor(() => expect(deleteSetor).toHaveBeenCalledWith('10'))
  })
})
