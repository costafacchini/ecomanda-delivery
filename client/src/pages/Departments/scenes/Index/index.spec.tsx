import DepartmentsIndex from './'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { getDepartments, deleteDepartment } from '../../../../services/department'
import { createRoutesStub } from 'react-router'
import { departmentFactory } from '../../../../factories/department'

vi.mock('../../../../services/department')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

describe('<DepartmentsIndex />', () => {
  const currentUser = {
    role: 'admin',
    licensee: { _id: 'lic-1', name: 'Acme', useDepartments: true },
  }

  function mount(user = currentUser) {
    const Stub = createRoutesStub([
      {
        path: '/departments',
        Component: () => <DepartmentsIndex currentUser={user} />,
      },
    ])
    render(<Stub initialEntries={['/departments']} />)
  }

  it('renders department list', async () => {
    ;(getDepartments as any).mockResolvedValue({
      status: 200,
      data: [
        departmentFactory.build({ id: '1', name: 'Suporte', active: true }),
        departmentFactory.build({ id: '2', name: 'Vendas', active: false }),
      ],
    })

    mount()

    expect(await screen.findByText('Suporte')).toBeInTheDocument()
    expect(await screen.findByText('Vendas')).toBeInTheDocument()
  })

  it('calls getDepartments with the current licensee id', async () => {
    ;(getDepartments as any).mockResolvedValue({ status: 200, data: [] })

    mount()

    await waitFor(() => expect(getDepartments).toHaveBeenCalledWith({ licensee: 'lic-1' }))
  })

  it('deletes a department when confirmed', async () => {
    ;(getDepartments as any).mockResolvedValue({
      status: 200,
      data: [departmentFactory.build({ id: '10', name: 'TI' })],
    })
    ;(deleteDepartment as any).mockResolvedValue({ status: 200 })

    vi.spyOn(window, 'confirm').mockReturnValue(true)

    mount()

    await screen.findByText('TI')

    fireEvent.click(screen.getByTitle('departments.deleteDepartmentTitle'))

    await waitFor(() => expect(deleteDepartment).toHaveBeenCalledWith('10'))
  })
})
