import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { createRoutesStub } from 'react-router'
import SectorForm from './'
import { getUsers } from '../../../../services/user'
import { AppContext } from '../../../../contexts/App'

vi.mock('../../../../services/user')
vi.mock('../../../../services/inbox', () => ({ getInboxes: vi.fn().mockResolvedValue({ data: [] }) }))
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
    licensee: { id: 'lic-1' },
  }

  const appContextValue = { activeLicensee: null, updateActiveLicensee: vi.fn() }

  function mount(props: any = {}) {
    ;(getUsers as any).mockResolvedValue({ data: [{ id: 'u1', name: 'Alice' }] })

    const Stub = createRoutesStub([
      {
        path: '/test',
        Component: () => (
          <AppContext.Provider value={appContextValue as any}>
            <SectorForm onSubmit={onSubmit} currentUser={currentUser} {...props} />
          </AppContext.Provider>
        ),
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

    await waitFor(() => expect(screen.getByText('departments.validation.nameRequired')).toBeInTheDocument())
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits with valid values', async () => {
    mount()

    fireEvent.change(screen.getByLabelText('common.name'), { target: { value: 'Suporte' } })
    fireEvent.click(screen.getByText('common.save'))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Suporte', active: true })))
  })
})
