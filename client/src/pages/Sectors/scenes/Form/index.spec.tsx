import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { createRoutesStub } from 'react-router'
import SectorForm from './'
import { getUsers } from '../../../../services/user'

vi.mock('../../../../services/user')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

describe('<SectorForm />', () => {
  const onSubmit = vi.fn()
  const currentUser = {
    role: 'admin',
    licensee: { _id: 'lic-1' },
  }

  function mount(props: any = {}) {
    ;(getUsers as any).mockResolvedValue({ data: [{ id: 'u1', name: 'Alice' }] })

    const Stub = createRoutesStub([
      {
        path: '/test',
        Component: () => <SectorForm onSubmit={onSubmit} currentUser={currentUser} {...props} />,
      },
    ])
    render(<Stub initialEntries={['/test']} />)
  }

  it('renders with default initial values', () => {
    mount()

    expect(screen.getByLabelText('common.name')).toHaveValue('')
    expect(screen.getByLabelText('common.active')).toBeChecked()
  })

  it('can receive initial values', () => {
    mount({ initialValues: { name: 'Suporte', active: false } })

    expect(screen.getByLabelText('common.name')).toHaveValue('Suporte')
    expect(screen.getByLabelText('common.active')).not.toBeChecked()
  })

  it('validates that name is required', async () => {
    mount()

    fireEvent.click(screen.getByText('common.save'))

    await waitFor(() => expect(screen.getByText('sectors.validation.nameRequired')).toBeInTheDocument())
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits with valid values', async () => {
    mount()

    fireEvent.change(screen.getByLabelText('common.name'), { target: { value: 'Suporte' } })
    fireEvent.click(screen.getByText('common.save'))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Suporte', active: true })))
  })
})
