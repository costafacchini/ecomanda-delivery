import SectorsIndex from './'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { getSectors, deleteSector } from '../../../../services/sector'
import { createRoutesStub } from 'react-router'
import { sectorFactory } from '../../../../factories/sector'

vi.mock('../../../../services/sector')

describe('<SectorsIndex />', () => {
  const currentUser = {
    role: 'admin',
    licensee: { _id: 'lic-1', name: 'Acme', useSectors: true },
  }

  function mount(user = currentUser) {
    const Stub = createRoutesStub([
      {
        path: '/sectors',
        Component: () => <SectorsIndex currentUser={user} />,
      },
    ])
    render(<Stub initialEntries={['/sectors']} />)
  }

  it('renders sector list', async () => {
    ;(getSectors as any).mockResolvedValue({
      status: 200,
      data: [
        sectorFactory.build({ id: '1', name: 'Suporte', active: true }),
        sectorFactory.build({ id: '2', name: 'Vendas', active: false }),
      ],
    })

    mount()

    expect(await screen.findByText('Suporte')).toBeInTheDocument()
    expect(await screen.findByText('Vendas')).toBeInTheDocument()
  })

  it('calls getSectors with the current licensee id', async () => {
    ;(getSectors as any).mockResolvedValue({ status: 200, data: [] })

    mount()

    await waitFor(() => expect(getSectors).toHaveBeenCalledWith({ licensee: 'lic-1' }))
  })

  it('deletes a sector when confirmed', async () => {
    ;(getSectors as any).mockResolvedValue({
      status: 200,
      data: [sectorFactory.build({ id: '10', name: 'TI' })],
    })
    ;(deleteSector as any).mockResolvedValue({ status: 200 })

    vi.spyOn(window, 'confirm').mockReturnValue(true)

    mount()

    await screen.findByText('TI')

    fireEvent.click(screen.getByTitle('Excluir setor'))

    await waitFor(() => expect(deleteSector).toHaveBeenCalledWith('10'))
  })
})
