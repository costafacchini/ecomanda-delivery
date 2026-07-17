import SectorEdit from './'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { getDepartment, updateDepartment, getDepartmentBaileysStatus } from '../../../../services/department'
import { getUsers } from '../../../../services/user'
import { createRoutesStub } from 'react-router'

vi.mock('../../../../services/department')
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
    ;(getDepartmentBaileysStatus as any).mockResolvedValue({ data: { connected: false } })

    const Stub = createRoutesStub([
      {
        path: '/departments/:id/edit',
        Component: () => <SectorEdit currentUser={currentUser} />,
      },
      {
        path: '/departments',
        Component: () => <div>Departments Index</div>,
      },
    ])
    render(<Stub initialEntries={['/departments/1/edit']} />)
  }

  it('renders the form with the received department', async () => {
    ;(getDepartment as any).mockResolvedValue({
      status: 200,
      data: { id: '1', name: 'Suporte', active: true, users: [] },
    })

    mount()

    await screen.findByDisplayValue('Suporte')
  })

  it('updates the department on submit', async () => {
    ;(getDepartment as any).mockResolvedValue({
      status: 200,
      data: { id: '1', name: 'Suporte', active: true, users: [] },
    })

    mount()

    await screen.findByDisplayValue('Suporte')

    fireEvent.change(screen.getByLabelText('common.name'), { target: { value: 'TI' } })

    ;(updateDepartment as any).mockResolvedValue({ status: 200 })

    fireEvent.click(screen.getByRole('button', { name: 'common.save' }))

    await waitFor(() =>
      expect(updateDepartment).toHaveBeenCalledWith(expect.objectContaining({ name: 'TI' }))
    )
  })
})
