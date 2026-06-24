import SectorEdit from './'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { getSector, updateSector, getSectorBaileysStatus } from '../../../../services/sector'
import { getUsers } from '../../../../services/user'
import { createRoutesStub } from 'react-router'

vi.mock('../../../../services/sector')
vi.mock('../../../../services/user')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

describe('<SectorEdit />', () => {
  const currentUser = {
    role: 'admin',
    licensee: { _id: 'lic-1' },
  }

  function mount() {
    ;(getUsers as any).mockResolvedValue({ data: [] })
    ;(getSectorBaileysStatus as any).mockResolvedValue({ data: { connected: false } })

    const Stub = createRoutesStub([
      {
        path: '/sectors/:id/edit',
        Component: () => <SectorEdit currentUser={currentUser} />,
      },
      {
        path: '/sectors',
        Component: () => <div>Sectors Index</div>,
      },
    ])
    render(<Stub initialEntries={['/sectors/1/edit']} />)
  }

  it('renders the form with the received sector', async () => {
    ;(getSector as any).mockResolvedValue({
      status: 200,
      data: { id: '1', name: 'Suporte', active: true, users: [] },
    })

    mount()

    await screen.findByDisplayValue('Suporte')
  })

  it('updates the sector on submit', async () => {
    ;(getSector as any).mockResolvedValue({
      status: 200,
      data: { id: '1', name: 'Suporte', active: true, users: [] },
    })

    mount()

    await screen.findByDisplayValue('Suporte')

    fireEvent.change(screen.getByLabelText('common.name'), { target: { value: 'TI' } })

    ;(updateSector as any).mockResolvedValue({ status: 200 })

    fireEvent.click(screen.getByRole('button', { name: 'common.save' }))

    await waitFor(() =>
      expect(updateSector).toHaveBeenCalledWith(expect.objectContaining({ name: 'TI' }))
    )
  })
})
