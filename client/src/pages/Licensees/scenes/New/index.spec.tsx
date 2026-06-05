import LicenseeNew from '.'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createRoutesStub } from 'react-router'
import { createLicensee } from '../../../../services/licensee'

vi.mock('../../../../services/licensee')

describe('<LicenseeNew />', () => {
  function mount(props = {}) {
    const currentUser = props.currentUser ?? { isPedidos10: false }
    const Stub = createRoutesStub([
      {
        path: '/licensees/new',
        Component: () => <LicenseeNew currentUser={currentUser} />,
      },
      {
        path: '/licensees',
        Component: () => <div>Licensees Index</div>,
      },
    ])
    render(<Stub initialEntries={['/licensees/new']} />)
  }

  async function fillIdentityStep() {
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Licensee Test' } })
    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'company' } })
    fireEvent.change(screen.getByLabelText('Documento'), { target: { value: '12345678000195' } })
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText('Telefone'), { target: { value: '48999999999' } })
  }

  async function advanceThroughAllSteps() {
    // Step 1: Identity
    await fillIdentityStep()
    fireEvent.click(screen.getByRole('button', { name: 'Próximo →' }))

    // Steps 2-3: Chat and ChatBot — click Próximo without choosing Sim (treated as No)
    // Step 4: WhatsApp is the last step (shows Salvar, not Próximo)
    for (let i = 0; i < 2; i++) {
      await waitFor(() => expect(screen.getByRole('button', { name: 'Próximo →' })).toBeInTheDocument())
      fireEvent.click(screen.getByRole('button', { name: 'Próximo →' }))
    }

    // Now on last step (WhatsApp)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument())
  }

  it('renders the wizard with Identity step on mount', () => {
    mount()

    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByLabelText('Tipo')).toBeInTheDocument()
    expect(screen.getByLabelText('Documento')).toBeInTheDocument()
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Licença')).toBeInTheDocument()
    expect(screen.getByLabelText('Telefone')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Próximo →' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Salvar' })).not.toBeInTheDocument()
  })

  it('shows validation errors on Step 1 when Next clicked with empty required fields', async () => {
    mount()

    fireEvent.click(screen.getByRole('button', { name: 'Próximo →' }))

    await waitFor(() => expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument())
  })

  it('advances to Chat step after filling all required Identity fields', async () => {
    mount()

    await fillIdentityStep()
    fireEvent.click(screen.getByRole('button', { name: 'Próximo →' }))

    await waitFor(() => expect(screen.getByText(/Passo 2/)).toBeInTheDocument())
  })

  it('shows Chat panel fields when Sim is selected on Chat step', async () => {
    mount()

    await fillIdentityStep()
    fireEvent.click(screen.getByRole('button', { name: 'Próximo →' }))

    await waitFor(() => expect(screen.getByText(/Passo 2/)).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Sim' }))

    await waitFor(() => expect(screen.getByLabelText('Chat padrão')).toBeInTheDocument())
  })

  it('does not show Chat fields when Não is selected', async () => {
    mount()

    await fillIdentityStep()
    fireEvent.click(screen.getByRole('button', { name: 'Próximo →' }))

    await waitFor(() => expect(screen.getByText(/Passo 2/)).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Não' }))

    expect(screen.queryByLabelText('Chat padrão')).not.toBeInTheDocument()
  })

  it('creates a new licensee when all integration steps answered with Não', async () => {
    createLicensee.mockResolvedValue({ status: 201, data: {} })
    mount()

    await advanceThroughAllSteps()
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(createLicensee).toHaveBeenCalled())
  })

  it('renders backend errors on last step when creation fails', async () => {
    createLicensee.mockResolvedValue({ status: 422, data: { errors: [{ message: 'Erro!' }] } })
    mount()

    await advanceThroughAllSteps()
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(screen.getByText('Erro!')).toBeInTheDocument())
  })

  it('Cancelar navigates to /licensees from Step 1', async () => {
    mount()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    await waitFor(() => expect(screen.getByText('Licensees Index')).toBeInTheDocument())
  })

  it('Voltar from Step 2 returns to Step 1', async () => {
    mount()

    await fillIdentityStep()
    fireEvent.click(screen.getByRole('button', { name: 'Próximo →' }))

    await waitFor(() => expect(screen.getByText(/Passo 2/)).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: '← Voltar' }))

    await waitFor(() => expect(screen.getByLabelText('Nome')).toBeInTheDocument())
    expect(screen.getByText(/Passo 1/)).toBeInTheDocument()
  })
})
