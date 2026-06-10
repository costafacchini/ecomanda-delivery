import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { createRoutesStub } from 'react-router'
import SetorForm from './'
import { getUsers } from '../../../../services/user'

vi.mock('../../../../services/user')

describe('<SetorForm />', () => {
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
        Component: () => <SetorForm onSubmit={onSubmit} currentUser={currentUser} {...props} />,
      },
    ])
    render(<Stub initialEntries={['/test']} />)
  }

  it('renders with default initial values', () => {
    mount()

    expect(screen.getByLabelText('Nome')).toHaveValue('')
    expect(screen.getByLabelText('Ativo')).toBeChecked()
  })

  it('can receive initial values', () => {
    mount({ initialValues: { name: 'Suporte', active: false } })

    expect(screen.getByLabelText('Nome')).toHaveValue('Suporte')
    expect(screen.getByLabelText('Ativo')).not.toBeChecked()
  })

  it('validates that name is required', async () => {
    mount()

    fireEvent.click(screen.getByText('Salvar'))

    await waitFor(() => expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument())
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits with valid values', async () => {
    mount()

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Suporte' } })
    fireEvent.click(screen.getByText('Salvar'))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Suporte', active: true })))
  })
})
